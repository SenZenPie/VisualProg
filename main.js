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
function getStatusColor(status) {
    switch (status) {
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
var capitalize = function (str, uppercase) {
    if (uppercase === void 0) { uppercase = false; }
    if (str.length === 0)
        return str;
    var result = str.charAt(0).toUpperCase() + str.slice(1);
    return uppercase ? result.toUpperCase() : result;
};
var trimAndFormat = function (str, uppercase) {
    if (uppercase === void 0) { uppercase = false; }
    var trimmed = str.trim();
    return uppercase ? trimmed.toUpperCase() : trimmed;
};
console.log(capitalize("hello world!"));
console.log(capitalize("hello world!", true));
console.log(trimAndFormat("   hello!   "));
console.log(trimAndFormat("   hello!   ", true));
