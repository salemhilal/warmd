var DB = require('bookshelf').DB,
    User = DB.User;

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}



module.exports = {

  // Look up u
  load: function(req, res, next, id) {
    User.forge({ userID: id })
      .fetch({ require: true }) // Make sure we find a matching ID
      .then(function (user) {
        req.user = user;
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
        res.json(req.user.attributes);
      },

      // They want HTML
      html: function() {
        res.render('users/show', req.user.attributes);
      },

      // They don't know what they want, give em HTML
      default: function() {
        res.render('user/show', req.user.attributes);
      }
    });
  },

  create: function(req, res) {
    console.log(req.body);
    res.json({response: "aww yeah"});

  }


};
