var DB = require('bookshelf').DB;

var Artist = DB.Model.extend({
  tableName: "Artists"
});

var Artists = DB.model.extend({
  model: Play,
})

exports.model = Artist;
exports.collection = Artists;
