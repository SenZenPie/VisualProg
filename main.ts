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