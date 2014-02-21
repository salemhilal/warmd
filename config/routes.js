var users = require('../app/controllers/user.js'); 
var artists = require('../app/controllers/artist.js');
var programs = require('../app/controllers/program.js');

module.exports = function(app) {

  app.get("/ping", function(req,res) {
    res.end("pong");
  });


  /* User Routes */
  app.param('user', users.load);
  app.post('/users/new', users.create);
  app.get('/users/:user.:format', users.show);
  app.get('/users/:user', users.show);


  /* Artist Routes */
  console.log(artists);
  app.param('artist', artists.load);
  app.post('/artists/query', artists.query);
  app.get('/artists/:artist.:format', artists.show);
  app.get('/artists/:artist', artists.show);

  /* Program Routes */ 
  app.param('program', programs.load);
  app.get('/programs/:program.:format', programs.show);
  app.get('/programs/:program', programs.show);

};
