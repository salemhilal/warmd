var LocalStrategy = require('passport-local').Strategy,
   crypto = require('crypto'),
   DB = require('bookshelf').DB,
   User = DB.User;


module.exports = function(passport, config) {

   // user -> id
   passport.serializeUser(function(user, done) {
      done(null, user.id)
   });

   // id -> user
   passport.deserializeUser(function(id, done) {
      User.forge({
         userID: id
      })
         .fetch({
            require: true
         }) // Make sure we find a matching ID
      .then(function(user) {
         req.user = user;
         done(null, user);
      }, function(err) {
         if (err.message && err.message.indexOf("EmptyResponse") !== -1) {
            done(new Error("No such user"));
         } else {
            done(err);
         }
      });

   });

   // use local strategy
   passport.use(new LocalStrategy({
            usernameField: "User",
            passwordField: "Password",
         },
         function(username, password, done) {
            User.forge({
               User: username
            })
               .fetch({
                  require: true
               })
               .then(function(user) { // Found user
                  //TODO: Actually check the password.
                  return done(null, user);

               }, function(err) { // Could not find user / something went wrong
                  return done(null, false, {
                     message: "No such user"
                  });
               });
         }
    ));

};
