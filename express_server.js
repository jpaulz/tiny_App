const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');// body parser is a middleware that helps to see only the data from submitted
const bcrypt = require('bcrypt');
const {  getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');


app.use(cookieSession({
  secret: "mbikujnvbhytgvf"
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use((req, res, next) => {
  res.locals = {
    "user_id": req.session["user_id"]
  };
  next();
});

const users = {};
const urlDatabase = {};

/*
 * Functions
 */

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>");
});

/**
 * REGISTER
 */
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const randomUserID = generateRandomString();
  const { email, password } = req.body;// <- ES6 for const email = req.body.email etc
  if (email === "" || password === "") {
    res.status(400).send();
  }
  const emailExists = getUserByEmail(email, users);
  if (emailExists) {
    return res.status(400).send();
  }
  
  users[randomUserID] = {
    id: randomUserID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  
  req.session["user_id"] = randomUserID;//setting a user_id cookie containing the user's newly generated ID.
  res.redirect("/urls");
});

/**
 * LOGIN
 */
app.get("/login", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const existingUser = getUserByEmail(email, users);
  if (!existingUser) {
    return res.status(403).send();
  }
  if (bcrypt.compareSync(password, existingUser.password)) {
    return res.status(403).send();
  }
  req.session["user_id"] = existingUser.id;
  res.redirect("/urls");
});


/**
 * URLS
 */
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id]};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = {longURL: req.body.longURL, userID: req.session.user_id };
  res.status(200).send();
});

/**
 * NEW
 */
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id]};
  if (!req.session.user_id) {   //If user is not logged in
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

/**
 * SHORT URL SHOWING THE PAGE
 */
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});
/**
 * SHORT URL redirect to long URL
 */
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

/**
 * EDIT
 */
app.post("/urls/:shortURL", (req, res) => {
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);
  if (!userURLs[req.params.shortURL]) {
    return res.status(404).send();
  }
  userURLs[req.params.shortURL] = {longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect("/urls");
});

/**
 * DELETE
 */
app.post("/urls/:shortURL/delete", (req, res) => {
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);
  if (!userURLs[req.params.shortURL]) {
    return res.status(404).send();
  }
  delete userURLs[req.params.shortURL];
  res.redirect("/urls");
});

/**
 * LOGOUT
 */
app.post("/logout", (req, res) => {  //logging out and clearing the cookies
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
});

