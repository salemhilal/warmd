var DB = require('bookshelf').DB;

var Play = DB.Model.extend({
  tablename: "Plays",
});

exports.model = Play;
