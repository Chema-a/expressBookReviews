const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{'username' : 'Chema', 'password': '123'}];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
  //returns boolean
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

regd_users.put("/auth/review/", (req, res) => {
  // Check if user is logged in and has an authorization token
  if (req.session.authorization) {
    let token = req.session.authorization["accessToken"];

    // Verify the token
    jwt.verify(token, "access", (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "User not authenticated" });
      }

      // If token is valid, get the username from session and decoded token
      let user = req.session.authorization["username"];

      // Check if the ISBN is valid and exists in the books collection
      if (
        req.query.isbn &&
        req.query.isbn !== " " &&
        books[req.query.isbn] !== undefined
      ) {
        // If there's already a review by the same user, update it; otherwise, add a new review
        books[req.query.isbn].reviews[user] = req.body.review;
        
        // Send a success response
        return res.status(200).json({ message: "Review added/updated successfully" });
      } else {
        // If ISBN is not valid, send an error
        return res.status(400).json({ message: "This ISBN does not exist" });
      }
    });
  } else {
    // If the user is not logged in
    return res.status(403).json({ message: "User not logged in" });
  }
});

regd_users.delete('/auth/review/', function(req, res) {
  if (req.session.authorization) {
    let token = req.session.authorization["accessToken"];

    // Verify the token
    jwt.verify(token, "access", (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "User not authenticated" });
      }

      // If token is valid, get the username from session and decoded token
      let user = req.session.authorization["username"];

      // Check if the ISBN is valid and exists in the books collection
      if (
        req.query.isbn &&
        req.query.isbn !== " " &&
        books[req.query.isbn] !== undefined
      ) {
        // If there's already a review by the same user, update it; otherwise, add a new review
        books[req.query.isbn].reviews[user] = "";
        
        // Send a success response
        return res.status(200).json({ message: "Review deleted properly" });
      } else {
        // If ISBN is not valid, send an error
        return res.status(400).json({ message: "This ISBN does not exist" });
      }
    });
  } else {
    // If the user is not logged in
    return res.status(403).json({ message: "User not logged in" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
