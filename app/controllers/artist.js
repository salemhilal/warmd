var DB = require('bookshelf').DB,
    Artist = require('../models/artist').model,
    Artists = require('../models/artist').collection;


module.exports = {

  // Look up artist in context of request
  load: function(req, res, next, id) {
    Artist.forge({ ArtistID: id })
      .fetch({ require: true })
      .then(function (artist) {
        req.artist = artist;
        next();
      }, function (err) {
        if(err.message && err.message.indexOf("EmptyResponse") !== -1) {
          next(new Error('not found'));
        } else {
          next(err);
        }
      });
  },

  show: function(req, res) {
    res.format( {
      json: function() {
        res.json(200, req.artist.attributes);
      },
      default: function() {
        res.json(200, req.artist.attributes);
      }
             //TODO: other views?
    });
  },

  query: function(req, res) {
    var query = req.body.query;
    var limit = req.body.limit;

    // Make sure this query is a thang.
    if(!query) {
      res.json(400, {
        error: "bad request"
      });
    }


    /* I do my best to replicate the following query:
    select distinct *
    from (
      select *, 1 as rank from `Artists` where `Artist` like 'death'
      union
      select *, 2 as rank from `Artists` where `Artist` like 'death%'
      union
      select *, 3 as rank from `Artists` where `Artist` like '%death%'
    ) X
    order by rank
    */

    // Query exact matches (most relevant)
    var q1 = DB.knex("Artists").select(DB.knex.raw("*, 1 as `rank`")).from("Artists").where("Artist", "like", query);
    // Query "starts with" matches
    var q2 = DB.knex("Artists").select(DB.knex.raw("*, 2 as `rank`")).from("Artists").where("Artist", "like", query + "%");
    // Query "contains" matches (least relevant)
    var q3 = DB.knex("Artists").select(DB.knex.raw("*, 3 as `rank`")).from("Artists").where("Artist", "like", "%" + query + "%");


    // Of those, make sure they're distinct, and enforce an ordering and a limit.
    // We order first by relevancy, then by name. Relevancy is ordered as per the above queries.
    var exact = DB.knex("Artists").select().distinct("*").from(DB.knex.raw(
      "((" + q1.toString() + ") union (" + q2.toString() + ") union (" + q3.toString() + ")) X"
    )).orderBy('rank').orderBy("Artist");
    if(limit) {
      exact.limit(limit);
    }

    // Define promise resolution
    exact.then(function(results) {
      res.json(200, results);
    }, function (err) {
      res.json(500, err.toString());
    });


  }

}
