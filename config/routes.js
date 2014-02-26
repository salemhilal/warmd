var users = require('../app/controllers/user.js');
var artists = require('../app/controllers/artist.js');
var programs = require('../app/controllers/program.js');

var rendering = require('./rendering'),
    indexController = require('../app/controllers/index'),
    loginController = require('../app/controllers/login');

module.exports = function(app) {

   app.get("/ping", function(req,res) {
         res.end("pong");
         });


   // Home
   app.get('/', indexController.home);
   app.get('/home', ensureAuthenticated, indexController.userHome);


   // Auth
   app.get('/register', loginController.registerPage);
   app.post('/register', loginController.registerPost);
   app.get('/login', loginController.loginPage);
   app.post('/login', loginController.checkLogin);
   app.get('/logout', loginController.logout);

   app.get('/apitest', function(req, res) {
         rendering.render(req, res, {
            'data': {
            'test': {
            'testsub': {
            'str': 'testsub hello world'
            },
            'testsub2': 42
            },
            'test2': 'hello world'
            }
            });
         })


   // Auth Middleware
   function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) { return next(); }
      res.redirect('/login');
   }


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
