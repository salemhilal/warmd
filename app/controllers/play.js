var DB = require('bookshelf').DB,
		Play = require('../models/play').model,
		Plays = require('../models/play').collection.forge();


module.exports = {
	load: function(req, res, next, id) {
		Play.
			forge({PlayID: id}).
			fetch({
				withRelated: ['artist'],
			}).
			then(function(play){
				req.play = play;
				next();
			}, function(err) {
				net(err);
			})
	},

	create: function(req, res) {
		var newPlay = req.body;
		new Play({
			Time: newPlay.time,
			PlayListID: newPlay.playListID,
			ArtistID: newPlay.artistID,
			AlbumID: newPlay.albumID,
			AltAlbum: newPlay.altAlbum,
			TrackName: newPlay.trackName,
			Mark: newPlay.mark,
			B: newPlay.B,
			R: newPlay.R
		}).
		save().
		then(function(play) {
			res.json(200, play);
		});
	},

	show: function(req, res) {
		if(req.play) {
			res.json(200, req.play);
		} else {
			res.json(404, {error: "Play not found"});
		}
	},

	query: function(req, res) {
		var playlistID = req.body.playlistID;
		var limit = req.body.limit

		Plays.
			query(function (qb) {
				qb.where('PlayListID', '=', playlistID);

				if(limit && typeof limit === "number") {
					qb.limit(limit);
				}
			}).
			fetch().
			then(function(plays) {
				res.json(200, plays.toJSON({shallow: true}));
			});
	}
}
