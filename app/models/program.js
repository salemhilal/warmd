var Bookshelf = require('bookshelf').DB,
    Playlist = require('./playlist').model;

var Program = Bookshelf.Model.extend({

  tableName: "Programs",
  idAttribute: "ProgramID",

  playlists: function() {
    return this.hasMany(Playlist, "ProgramID");
  },


});

exports.model = Program;
