import { describe, test, expect } from 'vitest';
import { 
    createWhere, 
    createSort, 
    createGroupBy, 
    createHaving,
    query 
} from './query.js';

describe('Типобезопасный конвейер преобразований', () => {
    type User = {
        id: number;
        name: string;
        surname: string;
        age: number;
        city: string;
    };

    const users: User[] = [
        { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
        { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
        { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
        { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
        { id: 5, name: "Alice", surname: "Smith", age: 28, city: "NY" },
    ];

    const where = createWhere<User>();
    const sort = createSort<User>();
    const groupBy = createGroupBy<User>();
    const having = createHaving<User>();

    describe('Where - фильтрация', () => {
        test('должен фильтровать по строковому полю', () => {
            const filterByName = query<User>(where("name", "John"));
            const result = filterByName(users);
            
            expect(result).toHaveLength(3);
            expect(result.every(u => u.name === "John")).toBe(true);
        });

        test('должен фильтровать по числовому полю', () => {
            const filterByAge = query<User>(where("age", 35));
            const result = filterByAge(users);
            
            expect(result).toHaveLength(2);
            expect(result.every(u => u.age === 35)).toBe(true);
        });

        test('должен применять несколько фильтров', () => {
            const filterJohnDoe = query<User>(
                where("name", "John"),
                where("surname", "Doe")
            );
            const result = filterJohnDoe(users);
            
            expect(result).toHaveLength(3);
            expect(result.every(u => u.name === "John" && u.surname === "Doe")).toBe(true);
        });
    });

    describe('Sort - сортировка', () => {
        test('должен сортировать по числовому полю по возрастанию', () => {
            const sortByAge = query<User>(sort("age"));
            const result = sortByAge(users);
            
            expect(result[0].age).toBe(28);
            expect(result[1].age).toBe(33);
            expect(result[2].age).toBe(34);
            expect(result[3].age).toBe(35);
            expect(result[4].age).toBe(35);
        });

        test('должен сортировать по строковому полю', () => {
            const sortByName = query<User>(sort("name"));
            const result = sortByName(users);
            
            expect(result[0].name).toBe("Alice");
            expect(result[1].name).toBe("John");
            expect(result[2].name).toBe("John");
            expect(result[3].name).toBe("John");
            expect(result[4].name).toBe("Mike");
        });
    });

    describe('GroupBy - группировка', () => {
        test('должен группировать по городу', () => {
            const groupByCity = groupBy("city");
            const result = groupByCity(users);
            
            expect(result).toHaveLength(2);
            
            const nyGroup = result.find(g => g.key === "NY");
            const laGroup = result.find(g => g.key === "LA");
            
            expect(nyGroup?.items).toHaveLength(3);
            expect(laGroup?.items).toHaveLength(2);
            expect(nyGroup?.items.every(u => u.city === "NY")).toBe(true);
            expect(laGroup?.items.every(u => u.city === "LA")).toBe(true);
        });

        test('должен группировать по имени', () => {
            const groupByName = groupBy("name");
            const result = groupByName(users);
            
            expect(result).toHaveLength(3);
            
            const johnGroup = result.find(g => g.key === "John");
            const mikeGroup = result.find(g => g.key === "Mike");
            const aliceGroup = result.find(g => g.key === "Alice");
            
            expect(johnGroup?.items).toHaveLength(3);
            expect(mikeGroup?.items).toHaveLength(1);
            expect(aliceGroup?.items).toHaveLength(1);
        });
    });

    describe('Having - фильтрация групп', () => {
        test('должен фильтровать группы по размеру', () => {
            const groups = groupBy("city")(users);
            const filterGroups = having(group => group.items.length > 2);
            const result = filterGroups(groups);
            
            expect(result).toHaveLength(1);
            expect(result[0].key).toBe("NY");
            expect(result[0].items).toHaveLength(3);
        });

        test('должен фильтровать группы по условию внутри элементов', () => {
            const groups = groupBy("city")(users);
            const filterGroups = having(group => group.items.some(u => u.age > 34));
            const result = filterGroups(groups);
            
            expect(result).toHaveLength(1);
            expect(result[0].key).toBe("LA");
        });
    });

    describe('Комбинированные конвейеры', () => {
        test('фильтрация + сортировка', () => {
            const pipeline = query<User>(
                where("name", "John"),
                where("surname", "Doe"),
                sort("age")
            );
            
            const result = pipeline(users);
            
            expect(result).toHaveLength(3);
            expect(result[0].age).toBe(33);
            expect(result[1].age).toBe(34);
            expect(result[2].age).toBe(35);
        });

        test('фильтрация → группировка', () => {
            const filtered = where("surname", "Doe")(users);
            const grouped = groupBy("city")(filtered);
            
            expect(grouped).toHaveLength(2);
            
            const nyGroup = grouped.find(g => g.key === "NY");
            const laGroup = grouped.find(g => g.key === "LA");
            
            expect(nyGroup?.items).toHaveLength(2);
            expect(laGroup?.items).toHaveLength(2);
        });

        test('группировка → фильтрация групп', () => {
            const groups = groupBy("city")(users);
            const filteredGroups = having(group => group.items.length > 2)(groups);
            
            expect(filteredGroups).toHaveLength(1);
            expect(filteredGroups[0].key).toBe("NY");
        });

        test('полный конвейер: фильтрация → группировка → фильтрация групп', () => {
            const filtered = where("surname", "Doe")(users);
            const grouped = groupBy("city")(filtered);
            const result = having(group => group.items.some(u => u.age > 34))(grouped);
            
            expect(result).toHaveLength(1);
            expect(result[0].key).toBe("LA");
            expect(result[0].items).toHaveLength(2);
        });
    });
});