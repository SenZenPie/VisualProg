import { describe, test, expect } from 'vitest';
import { query, createGroupBy, createHaving } from './query.js';

describe('Lab5: Query pipeline with order enforcement', () => {
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

    describe('Correct order works', () => {
        test('where -> where -> groupBy -> having', () => {
            const result = query<User>()
                .where("surname", "Doe")
                .where("city", "NY")
                .groupBy("city")
                .having(g => g.items.length > 1)
                .execute(users);

            expect(result).toHaveLength(1);
            expect(result[0].key).toBe("NY");
            expect(result[0].items).toHaveLength(2);
            expect(result[0].items[0].age).toBeDefined();
            expect(result[0].items[1].age).toBeDefined();
        });

        test('where -> groupBy -> having', () => {
            const result = query<User>()
                .where("surname", "Doe")
                .groupBy("city")
                .having(g => g.items.length > 1)
                .execute(users);

            expect(result).toHaveLength(2);
        });

        test('where -> sort', () => {
            const result = query<User>()
                .where("name", "John")
                .sort("age")
                .execute(users);

            expect(result).toHaveLength(3);
            expect(result[0].age).toBe(33);
            expect(result[1].age).toBe(34);
            expect(result[2].age).toBe(35);
        });

        test('only where', () => {
            const result = query<User>()
                .where("name", "John")
                .execute(users);

            expect(result).toHaveLength(3);
        });

        test('only sort', () => {
            const result = query<User>()
                .sort("age")
                .execute(users);

            expect(result[0].age).toBe(28);
            expect(result[4].age).toBe(35);
        });

        test('where -> groupBy', () => {
            const result = query<User>()
                .where("surname", "Doe")
                .groupBy("city")
                .execute(users);

            expect(result).toHaveLength(2);
        });

        test('groupBy -> having -> sort (sort groups by key)', () => {
            const result = query<User>()
                .groupBy("city")
                .having(g => g.items.length > 1)
                .sort("key")
                .execute(users);

            expect(result).toHaveLength(2);
            expect(result[0].key).toBe("LA");
            expect(result[1].key).toBe("NY");
        });
    });

    describe('Incorrect order throws runtime errors', () => {
        test('sort before where throws error', () => {
            expect(() => {
                query<User>()
                    .sort("age")
                    .where("name", "John");
            }).toThrow();
        });

        test('groupBy before where throws error', () => {
            expect(() => {
                query<User>()
                    .groupBy("city")
                    .where("name", "John");
            }).toThrow();
        });

        test('having before groupBy throws error', () => {
            expect(() => {
                query<User>()
                    .where("name", "John")
                    .having(g => g.items.length > 1);
            }).toThrow();
        });

        test('sort before groupBy throws error', () => {
            expect(() => {
                query<User>()
                    .where("name", "John")
                    .groupBy("city")
                    .sort("age")
                    .having(g => g.items.length > 1);
            }).toThrow();
        });
    });

    describe('Runtime behavior', () => {
        test('groupBy works correctly', () => {
            const groupByFn = createGroupBy<User>()("city");
            const result = groupByFn(users);
            expect(result.find(g => g.key === "NY")?.items).toHaveLength(3);
        });

        test('having works correctly', () => {
            const groups = createGroupBy<User>()("city")(users);
            const havingFn = createHaving<User>()(g => g.items.length > 2);
            const result = havingFn(groups);
            expect(result).toHaveLength(1);
            expect(result[0].key).toBe("NY");
        });
    });
});