function createUser(id, name, email, isActive) {
    return {
        id: id,
        name: name,
        email: email,
        isActive: isActive
    };
}
function createBook(book) {
    return book;
}
var myBook = createBook({
    title: "Blood Meridian",
    author: "Cormac Mc'Kartey",
    genre: "Western"
});
console.log(myBook);
function calculateArea(shape, param) {
    if (shape === 'circle') {
        return Math.PI * param * param;
    }
    else {
        return param * param;
    }
}
console.log(calculateArea('circle', 4));
console.log(calculateArea('square', 10));
