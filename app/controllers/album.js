'use strict';

var DB = require('bookshelf').DB,
  Album = require('../models/album').model,
  Albums = require('../models/album').collection,
  request = require('request-json'),
  iTunes = request.newClient('https://itunes.apple.com'),
  _ = require('lodash');

module.exports = {

  // Preload album with id, as specified in the url
  load: function(req, res, next, id) {
    Album.
      forge({
        AlbumID: id
      }).
      fetch({
        withRelated: ['artist', 'reviews.user']
      }).
    then(function(album) { // Request returned (may or may not have found it)
      req.album = album;
      next();
    }, function(err) { // Something went wrong
      next(err);
    });
  },

  // Display current album, if it exists
  show: function(req, res) {
    if (req.album) {
      res.json(200, req.album);
    } else {
      res.json(404, {
        error: 'Album not found'
      });
    }
  },

  // Update given album with contents from body.
  update: function(req, res) {
    if (!req.album) {
      res.json(404, {
        error: 'Album not found'
      });
    } else {
      req.album.
        // Only update columns that exist.
        save(_.pick(req.body, Album.permittedAttributes), {
          patch: true
        }).
      then(function(model) {
        res.json(200, model);
      }, function(err) {
        res.json(400, {
          error: 'Error updating playlist',
          details: err
        });
      });
    }
  },

  // Gives album art results the given query. Returns the first result. Not very creative.
  // TODO: Make this a bit smarter. i.e. have return only one album, for example.
  cover: function(req, res) {
    console.log('Looking up:', req.query.artist, req.query.album);
    console.log('Querying iTunes for ' + '/search?term=' + encodeURI(req.query.artist) + '+' + encodeURI(req.query.album));
    iTunes.get('/search?term=' + encodeURI(req.query.artist) + '%20' + encodeURI(req.query.album), function(err, meta, body) {
      if (!err) {
        res.json(200, body);
      } else {
        res.json(400, {
          error: err
        });
      }
    });
  },

  query: function(req, res) {
    var query = req.body.query;
    var limit = req.body.limit;

    // Make sure this query is a thang.
    if (!query || typeof query !== 'string') {
      res.json(400, {
        error: 'bad request'
      });
    }

    // Sub-queries
    var q1 = DB.knex('Albums').select(DB.knex.raw('*, 1 as `rank`')).from('Albums').where('Album', 'like', query);
    var q2 = DB.knex('Albums').select(DB.knex.raw('*, 2 as `rank`')).from('Albums').where('Album', 'like', query + '%');
    var q3 = DB.knex('Albums').select(DB.knex.raw('*, 3 as `rank`')).from('Albums').where('Album', 'like', '%' + query + '%');

    // Cumulate these queries together
    var qb = DB.knex('Albums').
    select('*').
    groupBy('AlbumID').
    from(DB.knex.raw('((' +
                q1.toString() + ') union (' +
            q2.toString() + ') union (' +
        q3.toString() + ')) X')).
    orderBy('rank').
    orderBy('Album');

    // If there's a limit, add it to the query builder.
    if (limit) {
      qb.limit(limit);
    }

    qb.
      // Eager load the artists of the selected albums
      then(function(results) {
        if (results.length > 0) {
          return Albums.forge(results).load('artist');
        } else {
          return results;
        }
      }).
      // Return the results
    then(function(results) {
      res.json(200, results);
    }, function(err) {
      res.json(500, {
        error: err.toString()
      });
    });

  }
};
