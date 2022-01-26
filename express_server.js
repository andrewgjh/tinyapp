const generateRandomString = (length) => {
  const str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHJIJKLMNOPQRSTUVWXYZ';
  let randomID = ""
  for (var i = 1; i < length; i++) {
    randomID += str.charAt(Math.floor(Math.random() * str.length));
  }
  return randomID;
}


const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const PORT = 8080;
app.use(cookieParser());
app.use(express.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');

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
}
const checkForUser = (email, users) => {
  let registeredUsers = Object.values(users);
  for (let user of registeredUsers) {
    if (user.email === email) {
      return true;
    }
  }
  return false;
};
const passwordCheck = (email, password, users) => {
  let registeredUsers = Object.values(users);
  for (let user of registeredUsers) {
    if (user.email === email && user.password === password) {
      return true
    }
  }
  return false;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get('/', (req, res) => {
  res.send('Hello!');
});
app.get('/login', (req, res) => {
  const templateVars = {
    cookie: req.cookies,
  }
  res.render("user_login", templateVars);
});
app.post('/register', (req, res) => {
  const {
    email,
    password
  } = req.body;

  if (checkForUser(email, users) || !email || !password) {
    res.status(400);
    res.send("Error!");
  }
  const randomUserID = generateRandomString(12);
  users[randomUserID] = {
    id: randomUserID,
    email,
    password
  }
  res.cookie('user_id', email);
  res.redirect('/urls');
});

app.get('/register', (req, res) => {

  const templateVars = {
    cookie: req.cookies,
  }
  res.render('user_registration', templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    cookie: req.cookies,
    urls: urlDatabase,
  }
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  if(!req.cookies['user_id']){
    res.redirect('/login');
  }
  const templateVars = {
    cookie: req.cookies,
  }
  res.render('urls_new', templateVars);
});

app.post("/urls", (req, res) => {
  let randomID = generateRandomString(6);
  urlDatabase[randomID] = req.body.longURL;
  res.redirect(`/urls/${randomID}`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL
  res.redirect("/urls");
});
app.post("/login", (req, res) => {
  const {
    email,
    password
  } = req.body;
  if (checkForUser(email, users)) {
    if (passwordCheck(email, password, users)) {
      res.cookie('user_id', email);
      res.redirect("/urls");
    }
    res.redirect('/login');
  } else {
    res.status(403).send('User cannot be found. Please register an account.');
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    cookie: req.cookies,
    username: req.cookies['user_id'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html> \n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});