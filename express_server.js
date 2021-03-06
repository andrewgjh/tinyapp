const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  shortURLExist,
  passwordCheck
} = require('./helpers');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const express = require('express');
const methodOverride = require('method-override');
const app = express();
const PORT = 8080;

app.use(methodOverride('_method'))
app.use(cookieSession({
  name: 'session',
  keys: [generateRandomString(8), generateRandomString(8)],
}))
app.use(express.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');

//databases
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
}
const urlDatabase = {
  "b6UTxQ": {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
};

//root redirects to url list page
app.get('/', (req, res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//login and register routes
app.get('/login', (req, res) => {
  if (req.session['user_id']) {
    res.redirect('/urls')
  }
  const templateVars = {
    cookie: req.session,
  }
  res.render("user_login", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const passwordEntry = req.body.password;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (getUserByEmail(email, users) || !email || !passwordEntry) {
    res.status(400);
    res.send("Error!");
  }
  const randomUserID = generateRandomString(12);
  users[randomUserID] = {
    id: randomUserID,
    email,
    password
  }
  req.session['user_id'] = email;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const {
    email,
    password
  } = req.body;
  if (getUserByEmail(email, users)) {
    if (passwordCheck(email, password, users)) {
      req.session['user_id'] = email;
      res.redirect("/urls");
    }
    res.send("Password does not match the one on file.");
  } else {
    res.status(403).send('User cannot be found. Please register an account.');
  }
});
app.get('/register', (req, res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
  }
  const templateVars = {
    cookie: req.session,
  }
  res.render('user_registration', templateVars);
});

//main page with url list
app.get('/urls', (req, res) => {
  const urlList = urlsForUser(req.session['user_id'], urlDatabase);
  const templateVars = {
    cookie: req.session,
    urls: urlList,
  }
  res.render('urls_index', templateVars);
});

//pages to create/view/edit a shortUrl 
app.get('/urls/new', (req, res) => {
  if (!req.session['user_id']) {
    res.redirect('/login');
  }
  const templateVars = {
    cookie: req.session,
  }
  res.render('urls_new', templateVars);
});
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.newURL
  res.redirect("/urls");
});
app.post("/urls", (req, res) => {
  if (req.session['user_id']) {
    let randomID = generateRandomString(6);
    urlDatabase[randomID] = {
      longURL: req.body.longURL,
      userID: req.session['user_id'],
      created: new Date().toDateString(),
    }
    res.redirect(`/urls/${randomID}`);
  } else {
    res.status(400).send("Please log in to create new URLs.")
  }
});
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.send("Page does not exist");
  };
  const templateVars = {
    cookie: req.session,
    username: req.session['user_id'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[shortURL].longURL,
    creator: urlDatabase[shortURL].userID
  }
  res.render("urls_show", templateVars);
});

//deleting any selected urls
app.delete("/urls/:shortURL/", (req, res) => {
  const sessionId = req.session["user_id"];
  const urlUser = urlDatabase[req.params.shortURL].userID;
  if (sessionId !== urlUser) {
    res.status(400).send("Unable to perform this action.");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

//links to actually site -longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURLExist(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(400).send("This link doe not exist.");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//catch all to return user to urls list if link does not exist
app.get('/*', (req, res) => {
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});