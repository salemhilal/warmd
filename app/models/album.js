var DB = require('bookshelf').DB;

var Album = DB.Model.extend({
	tableName: "Albums",
	idAttribute: "AlbumID",
});

var Albums = DB.Collection.extend({
	model: Album,
});

exports.model = Album;
exports.collection = Albums;
