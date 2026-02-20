interface User {
    id: number;
    name: string;
    email?: string;
    isActive: boolean;
}

function createUser (id:number, name:string, email:string, isActive:boolean): User {
    return {
        id: id,
        name: name,
        email: email,
        isActive: isActive
    };
}

interface Book {
    title: string;
    author: string;
    year?: number;
    genre: string | number;
}

function createBook (book: Book) : Book {
    return book;
}

const myBook = createBook({
    title: "Blood Meridian",
    author: "Cormac Mc'Kartey",
    genre: "Western"
});

console.log(myBook);

function calculateArea(shape: 'circle', radius: number): number;
function calculateArea(shape: 'square', side: number): number;
function calculateArea(shape: 'circle' | 'square', param: number): number{
    if (shape === 'circle') {
        return Math.PI * param * param;
    } else {
        return param * param;
    }
}

console.log(calculateArea('circle', 4));
console.log(calculateArea('square', 10));

type Status = 'active' | 'inactive' | 'new';
function  getStatusColor(status: Status): string{
    switch (status){
        case 'active':
            return 'green';
        case 'inactive':
            return 'red';
        case 'new':
            return 'blue';
        default:
            return '';
    }           
}

type StringFormatter = (str: string, uppercase?: boolean) => string;

const capitalize: StringFormatter = (str, uppercase = false) => {
    if (str.length === 0) return str;
    const result = str.charAt(0).toUpperCase() + str.slice(1);
    return uppercase ? result.toUpperCase() : result;
};

const trimAndFormat: StringFormatter = (str, uppercase = false) => {
    const trimmed = str.trim();
    return uppercase ? trimmed.toUpperCase() : trimmed;
};

console.log(capitalize("hello world!"));
console.log(capitalize("hello world!", true));
console.log(trimAndFormat("   hello!   "));
console.log(trimAndFormat("   hello!   ", true));

function getFirstElement<T>(arr: T[]): T | undefined {
    return arr[0];
}

const numbers = [10, 20, 30];
const firstNum = getFirstElement(numbers);
console.log(`Первое число: ${firstNum}`);

const strings = ["TypeScript", "JavaScript", "Python"];
const firstStr = getFirstElement(strings);
console.log(`Первая строка: ${firstStr}`);

console.log(`Пустой массив: ${getFirstElement([])}`);

