"use strict";

var DB = require('bookshelf').DB,
  Program = require('../models/program').model,
  Programs = DB.Collection.extend ({
    model: Program
  }).forge();

module.exports = {

  //Look up program in context of request
  load: function(req, res, next, id) {
    Program.forge({
        ProgramID: id
      })
      .fetch({
        withRelated: ['playlists'],
      })
      .then (function(program) {
      req.program = program;
      next();
    }, function(err) {
      if (err.message && err.message.indexOf('EmptyResponse') !== -1) {
        next(new Error('not found'));
      } else {
        next(err);
      }
    });
  },

  show: function(req, res) {
    if (req.program) {
      res.json(200, req.program);
    } else {
      res.json(404, {
        error: "Program not found"
      });
    }
  },

  update: function(req, res) {
    if (!req.program) {
      res.json(404, {
        error: "Program not found"
      });
    } else {
      req.program.
        save(req.body, {
          patch: true
        }).
      then(function(model) {
        res.json(200, model);
      }, function(err) {
        res.json(400, {
          error: "Error updating program",
          details: err
        });
      });
    }
  },

  query: function(req, res) {
    var query = req.body.query;

    // existance?
    if (!query) {
      res.json({
        error: "BAD REQUEST",
        code: 400
      });
    }

    //Query DB via k'nex
    Program.query(function(qb) {
        qb.where("Program", "like", query)
          .orwhere("Program", "like", "%" + query + "%")
          .orwhere("StartTime", "is", query)
          .orwhere("Promocode", "is", query)
          .orwhere("DJName", "like", query)
          .orwhere("DJName", "like", "%" + query + "%")
          .limit(10);
      }).fetch()
      .then(function(collection) {
      res.json(collection.toJSON({
        shallow: true
      }));
    });
  }
}
