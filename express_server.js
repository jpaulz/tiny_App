const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");// body parser is a middleware that helps to see only the data from submitted

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use((req, res, next) => {
  res.locals = {
    "user_id": req.cookies["user_id"]
  };
  next();
});

const generateRandomString = function() {   //Generating a random string of 6 random alphanumeric characters
  return (Math.random().toString(36).substr(2, 6));
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>");
});

/**
 * REGISTER
 */
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const randomUserID = generateRandomString();
  const { email, password } = req.body;// <- ES6 for const email = req.body.email etc
  if (email === "" || password === "") {
    res.status(400).send();
  }
  const userValues = Object.values(users); //Accessing the objects inside the global users object
  const emailExists = userValues.some((user) => { //Checking if email exists in the global users object
    return email === user.email;
  });
  if (emailExists) {
    return res.status(400).send();
  }
  
  users[randomUserID] = {
    id: randomUserID,
    email: email,
    password: password
  };
  console.log(users);
  res.cookie("user_id", randomUserID);//setting a user_id cookie containing the user's newly generated ID.
  res.redirect("/urls");
});

/**
 * LOGIN
 */
app.get("/login", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userValues = Object.values(users); //Accessing the objects inside the global users object
  const existingUser = userValues.find((user) => { //Finding existing user by email
    return email === user.email;
  });
  if (!existingUser) {
    return res.status(403).send();
  }
  if (existingUser.password !== password) {
    return res.status(403).send();
  }
  res.cookie("user_id", existingUser.id);
  res.redirect("/urls");
});

/**
 * URLS
 */
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id]};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.status(200).send();
});

/**
 * SHORT URL
 */
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

/**
 * ID
 */
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newLongURL;
  console.log(req.params.id);
  res.redirect("/urls");
});

/**
 * NEW
 */
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id]};
  res.render("urls_new", templateVars);
});

/**
 * DELETE
 */
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

/**
 * LOGOUT
 */
app.post("/logout", (req, res) => {  //logging out and clearing the cookies
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

