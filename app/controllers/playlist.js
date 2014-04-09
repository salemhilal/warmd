var DB = require('bookshelf').DB,
    Playlist = require('../models/playlist').model;


module.exports = {

  load: function(req, res, next, id) {
    Playlist.
      forge({ PlayListID: id}).
      fetch({
        withRelated: ['plays', 'program'],
        // require: true,
      }).
      then(function(playlist) {
        req.playlist = playlist;
        next();
      }, function(err) {
        next(err);
      });
  },

  create: function(req, res) {
    var newPlaylist = req.body;
    new Playlist({
      StartTime: newPlaylist.startTime,
      EndTime: newPlaylist.endTime,
      UserID: newPlaylist.userID,
      Comment: newPlaylist.comment,
      ProgramID: newPlaylist.programID,
    }).save().then(function(model) {
      res.json(200, model);
    });
  },

  show: function(req, res) {
    // TODO: Do we need an HTML view here?
    if(req.playlist) {
      res.json(200, req.playlist);
    } else {
      res.json(404, {error: "Playlist not found"});
    }
  },

  update: function(req, res) {
    if(!req.playlist) {
      res.json(404, {error: "No such playlist"});
    } else {
      req.playlist.
        save(req.body, {patch: true}).
        then(function(model) {
          res.json(200, model);
        }, function(err) {
          res.json(400, {error: "Error updating playlist", details: err});
        })
    }
  },


}
