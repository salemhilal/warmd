var LocalStrategy = require('passport-local').Strategy,
   crypto = require('crypto'),
   wlog = require('winston'),
   DB = require('bookshelf').DB,
   User = require('../app/models/user').model;

// Password verification functions

encryptPassword = function(password, username){
   if (!password) return ''
   var encrypted, salt;
   try {
      salt = crypto.createCipher('aes256', password+username).final('hex');
      encrypted = crypto.createHmac('sha1', salt).update(password).digest('hex');
      return encrypted;
   } catch  (err) {
      return 'There was error!';
   }
}



module.exports = function(passport) {

   // user -> id
   passport.serializeUser(function(user, done) {
      done(null, user.attributes.UserID)
   });

   // id -> user
   passport.deserializeUser(function(id, done) {

      User.forge({
         userID: id
      })
      .fetch({
        withRelated: ['programs'],
        })
      .then(function(user) {
        if(!user) { // No user found
          done(null, false);
        } else {
          done(null, user);
        }
      }, function(err) {
         if (err.message && err.message.indexOf("EmptyResponse") !== -1) {
            done(new Error("No such user"));
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
         withRelated:['programs'],
       })
       .then(function(user) {
         if(!user) {
          return done(null, false);
         }
         // Found user
         console.log("Found user: ", user.attributes.User);
         if (encryptPassword(password, user.attributes.User) === user.attributes.Password){
            return done(null, user);
         } else {
            wlog.auth("Incorrect Password ",{User: user.attributes.User});
            return done(null, false);
         }
        }, function(err) { // Could not find user / something went wrong
          return done(err);
        });
     }
  ));

};
