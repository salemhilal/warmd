var DB = require('bookshelf').DB;

var Artist = DB.Model.extend({
  tableName: "Artists"
});

var Artists = DB.Collection.extend({
  model: Artist,
})

exports.model = Artist;
exports.collection = Artists;
