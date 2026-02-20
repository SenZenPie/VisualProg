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

