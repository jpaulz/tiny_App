const getUserByEmail = function(email, database) {
  const userValues = Object.values(database); //Accessing the objects inside the global users object
  return userValues.find((user) => { //Finding existing user by email
    return email === user.email;
  });
};

const generateRandomString = function() {   //Generating a random string of 6 random alphanumeric characters
  return (Math.random().toString(36).substr(2, 6));
};

const urlsForUser = function(currentUserId, urlDatabase) {
  const filteredUrls = {};
  const keys = Object.keys(urlDatabase); //Object.key changes object to an array
  keys.forEach(function(key) {
    if (urlDatabase[key].userID === currentUserId) {
      filteredUrls[key] = urlDatabase[key]; //Added key-value pair from urlDatabase that matches this user Id
    }
  });
  return filteredUrls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };