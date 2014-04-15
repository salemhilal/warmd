var DB = require('bookshelf').DB,
  Artist = require('./artist'),
  Review = require('./review');

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

  reviews: function() {
    return this.hasMany(Review.model, "AlbumID");
  }
}, {
  permittedAttributes: [
    "Album",
		// "AlbumID", <-- Don't want anything changing its own id
		"ArtistID",
		"Comp",
		"DateAdded",
		"DateRemoved",
		"FormatID",
		"GenreID",
		"HighestChartPosition",
		"LabelID",
		"ReleaseNum",
		"ReviewPic",
		"Status",
		"Year"
  ]
});

var Albums = DB.Collection.extend({
  model: Album,
});

exports.model = Album;
exports.collection = Albums;
