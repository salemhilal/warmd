var express = require('express'),
    hbs = require('express-hbs');

module.exports = function(app, config) {
  app.set('showStackError', config.showStackError || true);

  app.use(express.logger()); // Log every request.
  appuse(express.static(config.root + '/public')); // Register public folder as a static dir


  app.engine('hbs', hbs.express3({
    partialsDir: config.root + '/app/views/partials',
    contentHelperName: 'content',
  }));

  app.set('view engine', 'hbs');
  app.set('views', config.root + '/app/views');

  app.configure(function() {
  
    // routes should be last
    app.use(app.router);

    // Lets handle errors
    app.use(function(err, req, res, next){
      // treat as 404
      if (err.message
        && (~err.message.indexOf('not found')
        || (~err.message.indexOf('Cast to ObjectId failed')))) {
        return next();
      }

      // log it
      // send emails if you want
      console.error(err.stack);

      // error page
      res.status(500).render('500', { error: err.stack });
    });

    // assume 404 since no middleware responded
    app.use(function(req, res, next){
      res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not found'
      };
    });

  });

}
