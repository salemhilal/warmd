var DB = require('bookshelf').DB,
    User = require('../models/user').model;

module.exports = {

  // Render a user login page
  login: function(req, res) {
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
        res.redirect('/login')
      }
    });
  },

  // Redirect users properly after logging in
  session: function(req, res) {
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
    res.json({response: "aww yeah"});

  },


};
