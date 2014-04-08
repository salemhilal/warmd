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

  // Get data about a specific user.
  // TODO: JSON only.
  show: function(req, res) {
    res.format( {
      json: function() {
        res.json(200, req.artist.attributes);
      },
      default: function() {
        res.json(200, req.artist.attributes);
      }
    });
  },

  //
  query: function(req, res) {
    var query = req.body.query;
    var limit = req.body.limit;

    // Make sure this query is a thang.
    if(!query || typeof query !== "string") {
      res.json(400, {
        error: "bad request"
      });
    }


    /* I do my best to replicate the following query:

      select *
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
    var qb = DB.knex("Artists").              // Create a query builder on the Artists table
        select("*").                          // select *
        groupBy("ArtistID").                  // group by ArtistID
        from(DB.knex.raw("((" +               // from (
            q1.toString() + ") union (" +     //   q1 union
            q2.toString() + ") union (" +     //   q2 union
            q3.toString() + ")) X")).         //   q3
        orderBy("rank").                      // ) order by rank, Artist
        orderBy("Artist");                    //

    // If there's a limit, add it to the query builder.
    if(limit) {
      qb.limit(limit);
    }

    // Define promise resolution. Boy do I like promises.
    qb.then(function(results) {
      res.json(200, results);
    }, function (err) {
      res.json(500, err.toString());
    });




  }

}
