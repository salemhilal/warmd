var DB = require('bookshelf').DB;

var Artist = DB.Model.extend({
  tableName: "Artists"
});

exports.model = Artist;
