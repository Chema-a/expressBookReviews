const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send({books: JSON.stringify(books)});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  if(books[req.params.isbn] === undefined){
    return res.status(401).send("No existe libro con este ISBN");
  }
  let book = books[req.params.isbn];
  return res.status(200).send({book: JSON.stringify(book)});
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let filtered_books = [];
  Object.keys(books).forEach(index => {
      if (books[index].author === req.params.author) {
        filtered_books.push(books[index]);
      }
  });
  if(filtered_books === undefined){
    return res.status(401).send({message: "No existe libro con este autor"});
  }
  return res.status(200).send({books: filtered_books});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let filtered_books = [];
  Object.keys(books).forEach(index => {
      if (books[index].title === req.params.title) {
        filtered_books.push(books[index]);
      }
  });
  if(filtered_books === undefined){
    return res.status(401).send({message: "No existe libro con este titulo"});
  }
  return res.status(200).send({books: filtered_books});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  if(books[req.params.isbn] === undefined){
    return res.status(401).send("No existe libro con este ISBN");
  }
  let book = books[req.params.isbn];
  return res.status(200).send({reviews: book.reviews});
});

module.exports.general = public_users;
