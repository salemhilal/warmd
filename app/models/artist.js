var DB = require('bookshelf').DB,
    Album = require('./album');

var Artist = DB.Model.extend({
  tableName: "Artists",
  idAttribute: "ArtistID",

  albums: function() {
    return this.hasMany(Album.model, "ArtistID");
  }
});

var Artists = DB.Collection.extend({
  model: Artist,
})

exports.model = Artist;
exports.collection = Artists;
