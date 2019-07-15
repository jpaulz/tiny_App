const getUserByEmail = function(email, database) {
  const userValues = Object.values(database); //Accessing the objects inside the global users object
  return userValues.find((user) => { //Finding existing user by email
    return email === user.email;
  });
};

module.exports = { getUserByEmail };