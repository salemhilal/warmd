var Bookshelf = require('bookshelf').DB,
    User = Bookshelf.User;

module.exports = {

  load: function(req, res, next, id) {
    User.forge({ userID: id })
      .fetch({ require: true }) // Make sure we find a matching ID
      .then(function (user) {
        req.user = user;
        next();
      }, function(err) {
        console.log("##############")
        console.log(err.message)
        console.log("##############")
        if(err.message && err.message.indexOf("EmptyResponse") != -1) {
          next(new Error('not found'))
        } else {
          next(err);
        }
      });
  },

  show: function(req, res) {
    console.log("Params, 2", req.params);
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
    })
  }  


}
