var Bookshelf = require('bookshelf').DB;

var User = Bookshelf.Model.extend({
    
  tableName: "Users",

  // Effectively how we define a schema?
  // Didn't include id, as that's something the DB should be handling, not the server
  permittedAttributes: [
    "permissions", // What role are they / what privs do they have?
    "fname",
    "lname",
    "phone",
    "email",        
    "djName",       // on-air DJ name TODO: do we put this under shows? 
    "dateTrained",  // Date of training
    "userName"      // Their username (i.e. shilal)    
  ]

});


module.exports = User;
