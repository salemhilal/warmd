'use strict';

var LocalStrategy = require('passport-local').Strategy,
   crypto = require('crypto'),
   DB = require('bookshelf').DB,
   User = require('../app/models/user').model, 
   utils = require('./middlewares/utils'),
   encryptPassword = utils.encryptPassword;

module.exports = function(passport) {

   // user -> id
   passport.serializeUser(function(user, done) {
      done(null, user.attributes.UserID);
   });

   // id -> user
   passport.deserializeUser(function(id, done) {

      User.forge({
         userID: id
      })
      .fetch() // Make sure we find a matching ID
      .then(function(user) {
        if(!user) { // No user found
          done(null, false);
        } else {
          done(null, user);
        }
      }, function(err) {
         if (err.message && err.message.indexOf('EmptyResponse') !== -1) {
            done(new Error('No such user'));
         } else {
            done(err);
         }
      });

   });

   // use local strategy
   passport.use(new LocalStrategy(
     function(username, password, done) {
       User.forge({
         User: username
       })
       .fetch({
         //require: true
       })
       .then(function(user) {
         if(!user) {
          return done(null, false);
         }
         // Found user
         if (encryptPassword(password, user.attributes.User) === user.attributes.Password){
            return done(null, user);
         } else {
            return done(null, false);
         }
        }, function(err) { // Could not find user / something went wrong
          return done(err);
        });
     }
  ));

};
