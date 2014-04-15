var DB = require('bookshelf').DB,
		Album = require('./album');

var Review = DB.Model.extend({
	tableName: "Reviews",
	idAttribute: "ReviewID",

	album: function() {
		this.belongsTo(Album.model, "AlbumID");
	}
});

var Reviews = DB.Collection.extend({
	model: Review,
});


exports.model = Review;
exports.collection = Reviews;
