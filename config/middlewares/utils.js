'use strict';
// This file contains various useful middlewares.

var crypto = require('crypto');


module.exports = {

  // Password verification functions
  encryptPassword : function(password, username){
    if (!password) { return ''; }
    var encrypted, salt;
    try {
      salt = crypto.createCipher('aes256', password+username).final('hex');
      encrypted = crypto.createHmac('sha1', salt).update(password).digest('hex');
      return encrypted;
    } catch  (err) {
      return 'There was error!';
    }
  }
};
