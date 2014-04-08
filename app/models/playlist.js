var DB = require('bookshelf').DB,
    Play = require('./play'),
    Program = require('./program');

var Playlist = DB.Model.extend({
  tableName: "PlayLists",
  idAttribute: "PlayListID",

  plays: function() {
    return this.hasMany(Play.model, "PlayListID");
  },

  program: function() {
    return this.belongsTo(Program.model, "ProgramID");
  },

  defaults: {
    StartTime: new Date(),
    EndTime: new Date(),
    UserID: 0,
    Comment: null,
  },
});

exports.model = Playlist;
