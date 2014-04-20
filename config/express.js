var express = require('express'),
    hbs = require('express-hbs'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    morgan = require('morgan'),
    methodOverride = require('method-override');

module.exports = function(app, config, passport) {

  // Config for specific environments. Nothing here yet, really.
  var env = process.env.NODE_ENV || 'development';
  if('development' == env) {
    // Show stack errors.
    app.set('showStackError', config.showStackError || true);
  }
  else if ('test' == env) {}
  else if ('production' == env) {}

  // Log requests. Should probably remove this when Winston
  // becomes a more implemented thing.
  app.use(morgan());

  // Set rendering engines
  app.engine('hbs', hbs.express3({
      partialsDir: config.root + '/app/views/partials',
      contentHelperName: 'content',
  }));

  app.set('view engine', 'hbs');
  app.set('views', config.root + '/app/views');


  // Config for all environments

  app.use(cookieParser());    // Cookies
  app.use(bodyParser());      // Request bodies (query params, payloads)
  app.use(methodOverride());  // PUT / DELETE request support
  app.use(session({
    secret: 'shilalisababby'  // <-- lol
  }));

  // use passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // Place app behind password protection. Must be after passport middleware
  app.use(function(req, res, next) {
    if (!req.user && req.path.indexOf('/app') === 0) {
      // Remember where they were going
      req.session.returnTo = req.originalUrl;
      res.redirect('/login');
    } else {
      next();
    }
  });

  // Serve static content. Must be after static security middleware
  app.use("/app", express.static(config.root + '/public/app'));
  // TODO: Have cache conditional on development/production variable
  app.use("/resources", express.static(config.root + '/public/resources' /*, {maxAge: 1000 * 60 * 60 * 24}*/));

  // Routes
  require('./routes')(app, config, passport);

  // Lets handle errors. This should be the last middleware, before the 404 handler.
  app.use(function(err, req, res, next) {
    // treat as 404
    if (err.message &&
          (~err.message.indexOf('not found') ||
          (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }

    if(err.message && err.message.indexOf("Unexpected") != -1) {
      res.json(400, {err: "Malformed request: " +err.message});
      return;
    }

    // log it
    // TODO: send emails
    console.error(err.stack);

    // error page
    res.status(500).render('500', {
      error: err.stack
    });
  });

  // 404 since no middleware responded
  app.use(function(req, res) { //
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found',
    });
  });
};
