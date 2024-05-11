const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!!username && !!password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      console.log(
        `pubus.post(/register): 200: username: '${username}' password: '${password}' registered!`,
        "users:\n",
        users
      );
      return res.status(200).json({
        message: "Customer successfully registered. You can login now!",
      });
    } else {
      console.log(
        `pubus.post(/register): 409: username: '${username}' already exists!`
      );
      return res.status(409).json({ message: "Customer already exists!" });
    }
  }
  console.log(
    `pubus.post(/register): 412: username: '${username}' and/or password: '${password}' is missing!`
  );
  return res.status(412).json({ message: "Unable to register the customer." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).json({ books: books });
});

// Get the book list available in the shop via async axios
public_users.get("/async", async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/");
    console.log("public_users.get(/async)", response.data);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(400).json(err);
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  let isbn = req.params.isbn;
  let book = !!isbn ? books[isbn] : undefined;

  if (!book || !isbn) {
    return res
      .status(404)
      .json({ message: "Error: ISBN is missing or out of range!" });
  }
  console.log("public_users.get(/isbn/:isbn)", JSON.stringify(book));
  return res.status(200).json(book);
});

// async Get book details based on ISBN
public_users.get("/async/isbn/:isbn", function (req, res) {
  let isbn = req.params.isbn;
  console.log("public_users.get(/async/isbn/:isbn)", isbn);
  axios
    .get(`http://localhost:5000/isbn/${isbn}`)
    .then((response) => {
      console.log("public_users.get(/async/isbn/:isbn).then", response.data);
      res.status(200).json(response.data);
    })
    .catch((err) => res.status(400).json(err));
});

// Get all books based on author
public_users.get("/author/:author", function (req, res) {
  let author = req.params.author;
  let authorBooks = [];

  if (!author) {
    return res.status(404).json({ message: "Error: author is missing" });
  }

  for (let [isbn, b] of Object.entries(books)) {
    if (b["author"].toLowerCase() === author.toLowerCase())
      authorBooks.push({ isbn: isbn, ...b });
  }
  return res.status(200).json({ booksbyauthor: authorBooks });
});

// async Get all books based on author
public_users.get("/async/author/:author", function (req, res) {
  let author = req.params.author;
  console.log("public_users.get(/async/author/:author)", author);
  axios
    .get(`http://localhost:5000/author/${author}`)
    .then((response) => {
      console.log(
        "public_users.get(/async/author/:author).then",
        response.data
      );
      res.status(200).json(response.data);
    })
    .catch((err) => res.status(400).json(err));
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  let title = req.params.title;
  let titleBooks = [];

  if (!title) {
    return res.status(404).json({ message: "Error: title is missing" });
  }

  for (let [isbn, b] of Object.entries(books)) {
    if (b["title"].toLowerCase() === title.toLowerCase())
      titleBooks.push({ isbn: isbn, ...b });
  }
  return res.status(200).json({ booksbytitle: titleBooks });
});

// async Get all books based on title
public_users.get("/async/title/:title", function (req, res) {
  let title = req.params.title;
  console.log("public_users.get(/async/title/:title)", title);
  axios
    .get(`http://localhost:5000/title/${title}`)
    .then((response) => {
      console.log("public_users.get(/async/title/:title).then", response.data);
      res.status(200).json(response.data);
    })
    .catch((err) => res.status(400).json(err));
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  let isbn = req.params.isbn;
  let bookReviews = [];

  if (!isbn) {
    return res.status(404).json({ message: "Error: ISBN is missing" });
  }
  let book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Error: ISBN is out of range" });
  }

  return res
    .status(200)
    .json({ reviewsbyisbn: { isbn: isbn, reviews: book["reviews"] } });
});

module.exports.general = public_users;
