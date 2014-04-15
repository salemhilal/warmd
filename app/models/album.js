var DB = require('bookshelf').DB,
		Artist = require('./artist');

var Album = DB.Model.extend({
	tableName: "Albums",
	idAttribute: "AlbumID",

	// TODO: Add models for these three relations
	/*label: function() {},
	genre: function() {},
	format: function() {},*/

	// The album's artist
	artist: function() {
		return this.belongsTo(Artist.model, "ArtistID");
	},
});

var Albums = DB.Collection.extend({
	model: Album,
});

exports.model = Album;
exports.collection = Albums;
