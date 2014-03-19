var DB = require('bookshelf').DB;

var Play = DB.Model.extend({
  tablename: "Plays"
});

exports.Play = Play;
