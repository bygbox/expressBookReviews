const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => user.username === username);
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    console.log(
      `regus.post(/login): 412: username: '${username}' and/or password: '${password}' is missing!`
    );
    return res.status(412).json({ message: "Error logging in" });
  }
  console.log(
    `regus.post(/login): username: '${username}' password: '${password}'`
  );
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        usr: username,
        pwd: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    console.log(
      `regus.post(/login): 200: username: '${username}' password: '${password}' logged in!`
    );
    console.log("regus.post(/login):accessToken:", accessToken);
    console.log("regus.post(/login):req.ses.authz:", req.session.authorization);
    return res.status(200).send("Customer successfully logged in.");
  } else {
    console.log(
      `regus.post(/login): 401: username: '${username}' password: '${password}' invalid creds!`
    );

    return res
      .status(401)
      .json({ message: "Invalid Login. Check username and password!" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let user = req.session?.authorization?.username;
  let isbn = req.params.isbn;
  let review = req.query.review;
  let book = !!isbn ? books[isbn] : undefined;
  console.log(
    `regd_users.put(/auth/review/:isbn) BEF: user:${user} isbn:${isbn} review:'${review}' book:`,
    book
  );
  if (!user) {
    return res.status(404).json({
      message: "Error: Customer not logged in! [username not present!]",
    });
  }
  if (!book || !isbn) {
    return res
      .status(404)
      .json({ message: "Error: ISBN is missing or out of range!" });
  }
  if (typeof review === "undefined") {
    return res.status(404).json({ message: "Error: review is missing!" });
  }
  let bRev = book["reviews"];
  bRev[user] = review;
  console.log(
    `regd_users.put(/auth/review/:isbn) AFT: user:${user} isbn:${isbn} review:'${review}' book:`,
    book
  );

  return res
    .status(200)
    .send(
      `The review for the book with ISBN:${isbn} has been added/updated by the user:${user}!`
    );
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let user = req.session?.authorization?.username;
  let isbn = req.params.isbn;
  let book = !!isbn ? books[isbn] : undefined;

  if (!user) {
    return res.status(404).json({
      message: "Error: Customer not logged in! [username not present!]",
    });
  }
  if (!book || !isbn) {
    return res
      .status(404)
      .json({ message: "Error: ISBN is missing or out of range!" });
  }
  let bRev = book["reviews"];
  let origRev = JSON.stringify(bRev[user], null, 2);
  delete bRev[user];
  return res
    .status(200)
    .send(
      `The review: \n${origRev} \nfor the book with ISBN:${isbn} has been deleted by the user:${user}!`
    );
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
