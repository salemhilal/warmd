var DB = require('bookshelf').DB,
    Program = require('./program'),
    Review = require('./review');

var User = DB.Model.extend({

  tableName: "Users",    // What table we're querying from
  idAttribute: "UserID", // The column representing sentinel id's

  programs: function() {
    return this.hasMany(Program.model, "UserID");
  },

  reviews: function() {
    return this.hasMany(Review.model, "UserID");
  }

}, {

});

var Users = DB.Collection.extend({
  model: User,
});


exports.model = User;
exports.collection = Users;
