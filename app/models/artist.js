var DB = require('bookshelf').DB;

var Artist = DB.Model.extend({
  tableName: "Artists",
  idAttribute: "ArtistID",
});

var Artists = DB.Collection.extend({
  model: Artist,
})

exports.model = Artist;
exports.collection = Artists;
