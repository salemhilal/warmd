var DB = require('bookshelf').DB;

// Play model
var Play = DB.Model.extend({
  tableName: "Plays",
  idAttribute: "PlayID",
});

// Play collection
var Plays = DB.Collection.extend({
  model: Play,

  // The playlist that this play belongs to
  // TODO: Should probably lazily load this one
  playlist: function() {
    return this.belongsTo(Playlist.model, "PlayListID");
  },

  // The artist of this play
  artist: function() {
    return this.hasOne(Artist.model, "ArtistID");
  },

  // The album of this play, if any
  // TODO: Create the album model
  // album: function() {
  //   return this.hasOne(Album.model, "AlbumID");
  // }
});

exports.model = Play;
exports.collection = Plays;
