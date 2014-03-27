var DB = require('bookshelf').DB,
		Play = require('../models/play').model,
		Plays = require('../models/play').collection.forge();


module.exports = {

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
