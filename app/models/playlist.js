var DB = require('bookshelf').DB,
    Play = require('./play').Play;

var Playlist = DB.Model.extend({
  tableName: "PlayLists",
  idAttribute: "PlayListID",

  plays: function() {
    return this.hasMany(Play, "ProgramID");
  }
});

exports.Playlist = Playlist;
