'use strict';
// This file contains various useful middlewares.

var crypto = require('crypto');

// Password verification functions
var encryptPassword = function(password, username){
  if (!password) { return ''; }
  var encrypted, salt;
  try {
    salt = crypto.createCipher('aes256', password+username).final('hex');
    encrypted = crypto.createHmac('sha1', salt).update(password).digest('hex');
    return encrypted;
  } catch  (err) {
    return 'There was error!';
  }
};

// Renders a JSON 401 error
// TODO: Make an errors.js somewhere
var json401 = function(req, res) {
  res.json(401, {
    error: 'You don\'t have permission to view this resource.'
  });
};

// Checks to see if user has access to an end point with special privs
var hasAccess = function(level, fail) {
  var levels = ['None', 'Trainee', 'User', 'Exec', 'Admin'];
  return function(req, res, next) {
    
    var minimumAuth = levels.indexOf(level);
    // Is the logged in user at *least* the provided level of auth?
    if (req.user && levels.indexOf(req.user.attributes.AuthLevel) >= minimumAuth) {
      next();
    } else {
      if (fail && typeof fail === 'function' ) {
        fail(req, res, next);
      } else {
        json401(req, res);
      }
    }
  };
};  


module.exports = {
  encryptPassword: encryptPassword,
  hasAccess: hasAccess,
  json401: json401
};