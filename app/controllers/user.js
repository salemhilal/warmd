var DB = require('bookshelf').DB,
    User = require('../models/user').model,
    Users = require('../models/user').collection;

module.exports = {

  // Render a user login page
  login: function(req, res) {

    res.format({
      // Asking for JSON but aren't authed.
      json: function () {
        // TODO: Make sure JSON errors are formatted uniformly. Maybe a util function?
        res.json(401, {
          error: "You don't have permission to view this resource. Try loggin in."
        })
      },

      // They were rerouted from something else, should just log in.
      html: function () {
        res.render('users/login');
      }
    });


    res.render('users/login');
  },

  // Log the user out, redirect back to login.
  logout: function(req, res) {
    req.logout();
    res.redirect('/login');
  },

  // Middleware to ensure the user is logged in.
  // TODO: Move this to some communal middlewares file.
  isAuthed: function(req, res, next) {
    process.nextTick(function() {
      if (req.isAuthenticated()) {
        return next();
      } else {
        // Remember where they were going
        req.session.returnTo = req.originalUrl;
        res.redirect('/login');
      }
    });
  },

  // Redirect users properly after logging in
  session: function(req, res) {

    // Redirect to where they were
    var redirectTo = req.session.returnTo ? req.session.returnTo : '/';
    delete req.session.returnTo;
    res.redirect(returnTo);
  },

  // Look up user
  load: function(req, res, next, id) {
    User.forge({ userID: id })
      .fetch({ require: true }) // Make sure we find a matching ID
      .then(function (user) {
        // Can't do req.user, interferes with passport
          req.userData = user;
        next();
      }, function(err) {
        if(err.message && err.message.indexOf("EmptyResponse") !== -1) {
          next(new Error('not found'));
        } else {
          next(err);
        }
      });
  },

  show: function(req, res) {
    res.format({

      // They want JSON
      json: function() {
        res.json(req.userData.attributes);
      },

      // They want HTML
      html: function() {
        res.render('users/show', req.userData.attributes);
      },

      // They don't know what they want, give em HTML
      default: function() {
        res.render('user/show', req.userData.attributes);
      }
    });
  },

  create: function(req, res) {
    console.log(req.body);
    // TODO: Implement this behind privileged auth
    res.json({response: "aww yeah"});

  },

  query: function(req, res) {
    var query = req.body.query;
    var limit = req.body.limit;

    // var q1 = DB.knex("Users").select(DB.knex./  )

    Users.
      forge().
      query(function(qb) {
        qb.
          where("User", "like", "%" + query + "%").
          orWhere("FName", "like", "%" + query + "%").
          orWhere("LName", "like", "%" + query + "%");

        if (limit && typeof limit === "number") {
          qb.limit(limit);
        }
      }).
      fetch().
      then(function(collection) {
        res.json(200, collection.toJSON({shallow: true}));
      }, function(err) {
        console.log("LOOK AT THIS SHIT", err)
        res.json(500, { message: "Something went wrong", err: err.toString()});
      });

  },


};
