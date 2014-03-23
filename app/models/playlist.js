var DB = require('bookshelf').DB,
    Play = require('./play').model;

var Playlist = DB.Model.extend({
  tableName: "PlayLists",
  idAttribute: "PlayListID",

  plays: function() {
    return this.hasMany(Play, "PlayListID");
  },

  defaults: {
    StartTime: new Date(),
    EndTime: new Date(),
    UserID: 0,
    Comment: null,
  },
});

exports.model = Playlist;
