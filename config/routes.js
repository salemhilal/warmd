var Bookshelf = require('bookshelf').DB,
    users = require('../app/controllers/user.js'), 
    User = Bookshelf.User; 

module.exports = function(app) {

  app.get("/ping", function(req,res) {
    res.end("pong");
  });


  /* User Routes */
  app.param('id', users.load);
  app.get('/users/:id.:format', users.show)
  app.get('/users/:id', users.show)
};
