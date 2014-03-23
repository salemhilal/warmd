var DB = require('bookshelf').DB;

var Play = DB.Model.extend({
  tableName: "Plays",
});

exports.model = Play;
