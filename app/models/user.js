var DB = require('bookshelf').DB,
    Program = require('./program').model;

var User = DB.Model.extend({

  tableName: "Users",    // What table we're querying from
  idAttribute: "UserID", // The column representing sentinel id's

  programs: function() {
    return this.hasMany(Program, "UserID");
  },

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
    "userName",     // Their username (i.e. shilal)
    "password"
  ],

  relations: [
    'programs', // has many
  ]

});

var Users = DB.Collection.extend({
  model: User,
});


exports.model = User;
exports.collection = Users;
