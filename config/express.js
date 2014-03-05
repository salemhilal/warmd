var express = require('express'),
    hbs = require('express-hbs'),
    acceptOverride = require('connect-acceptoverride');

module.exports = function(app, config, passport) {
    // Log every request.
    app.set('showStackError', config.showStackError || true);
    app.use(express.logger());


    // Register public folder as a static dir
    // app.use(express.static(config.root + '/public'));

    // Set rendering engines
    app.engine('hbs', hbs.express3({
        partialsDir: config.root + '/app/views/partials',
        contentHelperName: 'content',
    }));

    app.set('view engine', 'hbs');
    app.set('views', config.root + '/app/views');


    // Config for all environments
    // use configure(env, callback()) for other environments
    app.configure(function() {

      // Set headings for requests that forget to set headings
      app.use(acceptOverride());

      // Cookie parser before sessions, as sessions rely on cookies
      app.use(express.cookieParser());

      app.use(express.bodyParser());
      app.use(express.methodOverride());

      app.use(express.session({
        secret: 'shilalisababby' // <-- lol
      }));

      // use passport session
      app.use(passport.initialize())
      app.use(passport.session())

      // Place app behind password protection.
      // Must be after passport middleware
      app.use(function(req, res, next) {
        if (req.user == null && req.path.indexOf('/app') === 0) {
          res.redirect('/login');
        } else {
          next();
        }
      });

      app.use("/app", express.static(config.root + '/public/app'));
      app.use("/resources", express.static(config.root + '/public/resources'));

      // routes should be last
      app.use(app.router);

      // Lets handle errors
      app.use(function(err, req, res, next) {
        // treat as 404
        if (err.message &&
              (~err.message.indexOf('not found') ||
              (~err.message.indexOf('Cast to ObjectId failed')))) {
          return next();
        }

        // log it
        // TODO: send emails
        console.error(err.stack);

        // error page
        res.status(500).render('500', {
            error: err.stack
        });
      });

      // assume 404 since no middleware responded
      app.use(function(req, res) { //, next) {
        res.status(404).render('404', {
          url: req.originalUrl,
          error: 'Not found',
        });
      });

    });

};
