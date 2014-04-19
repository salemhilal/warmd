var Bookshelf = require('bookshelf').DB,
    Playlist = require('./playlist');

var Program = Bookshelf.Model.extend({

  tableName: "Programs",
  idAttribute: "ProgramID",

  playlists: function() {
    return this.hasMany(Playlist.model, "ProgramID");
  },


});

exports.model = Program;
