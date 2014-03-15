var DB = require('bookshelf').DB;

var Playlist = DB.Model.extend({
  tableName: "PlayLists"
});

exports.Playlist = Playlist;
