const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');// body parser is a middleware that helps to see only the data from submitted
const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./helpers');

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

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "aJ48Ty": {
    id: "aJ48Ty",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "geu7Gk": {
    id: "geu7Gk",
    email: "a@b.c",
    password: "abc123"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48Ty" },
  anc46E: { longURL: "https://www.yandex.ru", userID: "geu7Gk" }
};

/*
 * Functions
 */
const generateRandomString = function() {   //Generating a random string of 6 random alphanumeric characters
  return (Math.random().toString(36).substr(2, 6));
};

const urlsForUser = function(currentUserId) {
  const filteredUrls = {};
  const keys = Object.keys(urlDatabase); //Object.key changes object to an array
  keys.forEach(function(key) {
    if (urlDatabase[key].userID === currentUserId) {
      filteredUrls[key] = urlDatabase[key]; //Added key-value pair from urlDatabase that matches this user Id
    }
  });
  return filteredUrls;
};

// const getUserByEmail = function(email, database) {
//   const userValues = Object.values(database); //Accessing the objects inside the global users object
//   userValues.find((user) => { //Finding existing user by email
//     return email === user.email;
//   });
//   return null;
// };


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
  console.log(users);
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
  let templateVars = { urls: urlsForUser(req.session.user_id), user: users[req.session.user_id]};
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
  const userURLs = urlsForUser(req.session.user_id);
  if (!userURLs[req.params.shortURL]) {
    return res.status(404).send();
  }
  userURLs[req.params.shortURL] = {longURL: req.body.longURL, userID: req.session.user_id };
  console.log(req.params.id);
  res.redirect("/urls");
});

/**
 * DELETE
 */
app.post("/urls/:shortURL/delete", (req, res) => {
  const userURLs = urlsForUser(req.session.user_id);
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
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

