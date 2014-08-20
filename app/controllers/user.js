'use strict';

var DB = require('bookshelf').DB,
    User = require('../models/user').model,
    Users = require('../models/user').collection,
    utils = require('../../config/middlewares/utils'),
    encryptPassword = utils.encryptPassword,
    checkit = require('checkit');

module.exports = {

  // Render a user login page
  login: function(req, res) {

    res.format({
      // Asking for JSON but aren't authed.
      json: function() {
        // TODO: Make sure JSON errors are formatted uniformly. Maybe a util function?
        res.json(401, {
          error: 'You don\'t have permission to view this resource. Try loggin in.'
        });
      },

      // They were rerouted from something else, should just log in.
      html: function() {
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
    res.redirect(redirectTo);
  },

  // Look up user
  load: function(req, res, next, id) {
    User.forge({
        userID: id
      })
      .fetch({
        require: true
      }) // Make sure we find a matching ID
      .then(function(user) {
      // Can't do req.user, interferes with passport
      req.userData = user;
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
    res.format({
      // They want JSON
      json: function() {
        res.json(req.userData.toJSON());
      },

      // They want HTML
      html: function() {
        res.render('users/show', req.userData.toJSON());
      },

      // They don't know what they want, give em HTML
      default: function() {
        res.render('user/show', req.userData.toJSON());
      }
    });
  },

  create: function(req, res) {
    // TODO: Implement this behind privileged auth
    req.body.AuthLevel = 'None';

    // Ensure password length is at least 8, before it's encrypted
    // Other validation is done in the User model
    // TODO: Think about that a bit.

    checkit({ Password: ['required', 'minLength:8'] })
      .run(req.body)
      .then(function(valid) {
        req.body.Password = encryptPassword(req.body.Password, req.body.User);    
        return new User(req.body).save();
      })
      .then(function(model) {
        // TODO: SEND AN EMAIL HERE!
        res.json(200, model);
      }, function(err) {
        res.json(400, err);
      })
      .catch(checkit.Error, function(err) {
        res.json(400, err.toJSON());
      });
  },

  // Approve a pending user
  approve: function(req, res) {
    
    User.where({ UserID: req.body.id })
      .fetch()
      .then(function(user) {
        if(user.attributes.AuthLevel !== 'None') {
          res.json(400, {
            error: 'User already approved'
          });
        } else {
          user
            .set({AuthLevel: 'Training'})
            .save()
            .then(function(user) {
              res.json(200, user.toJSON());
            }, function(err) {
              res.json(500, err);
            });
        }
      });
  },

  // Lists pending users
  pending: function(req, res) {
    Users
      .forge()
      .query(function(qb) {
        qb.where('AuthLevel', 'like', 'None');
      })
      .fetch()
      .then(function(pendingUsers) {
        res.json(200, pendingUsers.toJSON({
          shallow: true
        }));
      }, function(err) {
        res.json(500, {
          message: 'Something went wrong', 
          err: err.toString() 
        });
      });

  },

  // Search for a user
  query: function(req, res) {
    var query = req.body.query;
    var limit = req.body.limit;

    Users.
      forge().
      query(function(qb) {
        qb.
          where('User', 'like', '%' + query + '%').
          orWhere('FName', 'like', '%' + query + '%').
        orWhere('LName', 'like', '%' + query + '%');

        if (limit && typeof limit === 'number') {
          qb.limit(limit);
        }
      }).
      fetch().
    then(function(collection) {
      res.json(200, collection.toJSON({
        shallow: true
      }));
    }, function(err) {
      res.json(500, {
        message: 'Something went wrong',
        err: err.toString()
      });
    });
  },

  // See if a user exists. Returns no personal info.
  exists: function(req, res) {
    var response;
    if (req.body.username && req.body.username.trim()) {
      response = Users.forge()
        .query('where', 'User', 'like', req.body.username.trim())
        .fetch();
    } else if (req.body.email && req.body.email.trim()) {
      response = Users.forge()
        .query('where', 'Email', 'like', req.body.email.trim())
        .fetch();
    } else {
      res.json({exists: false});
    }
    response.then(function(results) {
      res.json({exists: !!results.length});
    });
  }
};
