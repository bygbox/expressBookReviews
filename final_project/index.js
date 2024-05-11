const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  if (req.session.authorization) {
    //get the authorization object stored in the session
    token = req.session.authorization["accessToken"];
    jwt.verify(token, "access", (err, user) => {
      //Use JWT to verify token
      if (!err) {
        req.user = user;

        console.log(
          `app.use(/customer/auth): 200: user:'${user.usr}'/pwd:'${user.pwd}' is authenticated!`,
          "user obj:",
          user,
          "req.session.authorization obj:",
          req.session.authorization
        );
        next();
      } else {
        console.log(
          `app.use(/customer/auth): 403: user: '${user}' not authenticated!`,
          user
        );
        return res.status(403).json({ message: "Customer not authenticated" });
      }
    });
  } else {
    console.log(`app.use(/customer/auth): 403: Customer: ????? not logged in!`);
    return res.status(403).json({ message: "Customer not logged in" });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is listening on the port:${PORT}`));
