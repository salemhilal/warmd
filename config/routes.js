var users = require('../app/controllers/user.js'); 

module.exports = function(app) {

  app.get("/ping", function(req,res) {
    res.end("pong");
  });


  /* User Routes */
  app.param('id', users.load);
  app.post('/users/new', users.create);
  app.get('/users/:id.:format', users.show);
  app.get('/users/:id', users.show);

};
