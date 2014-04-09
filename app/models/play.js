var DB = require('bookshelf').DB,
    Playlist = require('./playlist'),
    Artist = require('./artist');

// Play model
var Play = DB.Model.extend({
  tableName: "Plays",
  idAttribute: "PlayID",

  // The playlist that this play belongs to
  // TODO: Should probably lazily load this one
  playlist: function() {
    return this.belongsTo(Playlist.model, "PlayListID");
  },

  // The artist of this play
  artist: function() {
    return this.belongsTo(Artist.model, "ArtistID");
  },

  // The album of this play, if any
  // TODO: Create the album model
  // album: function() {
  //   return this.hasOne(Album.model, "AlbumID");
  // }
});

// Play collection
var Plays = DB.Collection.extend({
  model: Play,
});

exports.model = Play;
exports.collection = Plays;
