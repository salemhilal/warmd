var DB = require('bookshelf').DB;

// Play model
var Play = DB.Model.extend({
  tableName: "Plays",
});

// Play collection
var Plays = DB.Collection.extend({
  model: Play,
});

exports.model = Play;
exports.collection = Plays;
