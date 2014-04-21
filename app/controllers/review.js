var DB = require('bookshelf').DB,
		Review = require('../models/review').model;

module.exports = {

	load: function(req, res, next, id) {
		Review.
			forge({ ReviewID: id }).
			fetch({
				withRelated:['user', 'album']
			}).
			then(function(review) {
				req.review = review;
				next();
			}, function(err) {
				next(err);
			});
	},

	show: function(req, res) {
		if(req.review) {
			res.json(200, req.review);
		} else {
			res.json(404, {error: "Review not found"});
		}
	},

	create: function(req, res) {
		var newReview = req.body;
		new Review({
			ReviewID: null,
			UserID: newReview.userID,
			AlbumID: newReview.albumID,
			Review: newReview.review,
		}).
			save().
			then(function(review){
				res.json(200, review);
			}, function(err) {
				res.json(400, {error: err});
			});
	}

};
