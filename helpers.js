const bcrypt = require('bcryptjs');

const getUserByEmail = function (email, database) {
  let registeredUsers = Object.values(database);
  for (let user of registeredUsers) {
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

const generateRandomString = (length) => {
  const str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHJIJKLMNOPQRSTUVWXYZ';
  let randomID = ""
  for (var i = 1; i < length; i++) {
    randomID += str.charAt(Math.floor(Math.random() * str.length));
  }
  return randomID;
}

const urlsForUser = (id, database) => {
  let obj = {};
  for (let entry in database) {
    if (database[entry].userID === id) {
      obj[entry] = database[entry]
    }
  }
  return obj;
};


const shortURLExist = (url, database) => {
  for (let id in database) {
    if (url === id) {
      return true;
    }
  }
  return false;
};


const passwordCheck = (email, password, users) => {
  let registeredUsers = Object.values(users);
  for (let user of registeredUsers) {

    if (user.email === email && (bcrypt.compareSync(password, user.password))) {
      return true
    }
  }
  return false;
};


module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  shortURLExist,
  passwordCheck
}