var DB = require('bookshelf').DB;

var Artist = DB.Model.extend({
  tableName: "Artists"
});

module.exports = Artist;
