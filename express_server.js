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

const urlsForUser = (id, database) => {
  let obj = {};
  for(let entry in database){
    if(database[entry].userID === id){
      obj[entry] = database[entry]
    }
  }
  return obj;
};


const urlDatabase = {
  "b6UTxQ": {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  "i3BoGr": {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "https://www.google.com",
    userID: "aJ48lW"
  }
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
  const urlList = urlsForUser(req.cookies['user_id'], urlDatabase);
  const templateVars = {
    cookie: req.cookies,
    urls: urlList,
  }
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  }
  const templateVars = {
    cookie: req.cookies,
  }
  res.render('urls_new', templateVars);
});

app.post("/urls", (req, res) => {
  let randomID = generateRandomString(6);
  urlDatabase[randomID] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  }
  res.redirect(`/urls/${randomID}`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  if(req.cookies["user_id"]!==urlDatabase[req.params.shortURL].userID){
    res.status(400).send("Unable to perform this action.");
  }else{
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.newURL
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
  if (!urlDatabase[req.params.shortURL]) {
    res.send("Page does not exist");
  };
  const templateVars = {
    cookie: req.cookies,
    username: req.cookies['user_id'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    creator: urlDatabase[req.params.shortURL].userID 
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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