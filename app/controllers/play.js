"use strict";

var DB = require('bookshelf').DB,
  Play = require('../models/play');

module.exports = {
  load: function(req, res, next, id) {
    Play.model.
      forge({
        PlayID: id
      }).
      fetch({
        withRelated: ['artist'],
      }).
    then(function(play) {
      req.play = play;
      next();
    }, function(err) {
      next(err);
    });
  },

  create: function(req, res) {
    var newPlay = req.body;
    new Play.model({
        Time: newPlay.time,
        PlayListID: newPlay.playListID,
        ArtistID: newPlay.artistID,
        AlbumID: newPlay.albumID,
        AltAlbum: newPlay.altAlbum,
        TrackName: newPlay.trackName,
        Mark: newPlay.mark,
        B: newPlay.B,
        R: newPlay.R,
        Ordering: newPlay.ordering,
      }).
      save().
    then(function(play) {
      res.json(200, play);
    });
  },

  show: function(req, res) {
    if (req.play) {
      res.json(200, req.play);
    } else {
      res.json(404, {
        error: "Play not found"
      });
    }
  },

  update: function(req, res) {
    if (!req.play) {
      res.json(404, {
        error: "Play not found"
      });
    } else {
      req.play.
        save(req.body, {
          patch: true
        }).
      then(function(model) {
        res.json(200, model);
      }, function(err) {
        res.json(404, {
          error: "No such play",
          details: err
        });
      })
    }
  },

  query: function(req, res) {
    var playlistID = req.body.playlistID;
    var limit = req.body.limit

    Play.collection.forge().
      query(function(qb) {
        qb.where('PlayListID', '=', playlistID);

        if (limit && typeoflimit === "number") {
          qb.limit(limit);
        }
      }).
      fetch().
    then(function(plays) {
      res.json(200, plays.toJSON({
        shallow: true
      }));
    });
  }
}
