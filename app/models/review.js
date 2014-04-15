var DB = require('bookshelf').DB,
		Album = require('./album'),
		User = require('./user');

var Review = DB.Model.extend({
	tableName: "Reviews",
	idAttribute: "ReviewID",

	album: function() {
		return this.belongsTo(Album.model, "AlbumID");
	},

	user: function() {
		return this.belongsTo(User.model, "UserID");
	}
});

var Reviews = DB.Collection.extend({
	model: Review,
});


exports.model = Review;
exports.collection = Reviews;
