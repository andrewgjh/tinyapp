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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase,
  }
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
  }
  res.render('urls_new',templateVars);
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
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
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