var express = require('express'),
    hbs = require('express-hbs'),
    // wares = require('./middlewares/utils.js'),
    acceptOverride = require('connect-acceptoverride');

module.exports = function(app, config, passport) {
    app.set('showStackError', config.showStackError || true);

    app.use(express.logger()); // Log every request.
    app.use(acceptOverride());
    app.use(express.static(config.root + '/public')); // Register public folder as a static dir

    // Authentication config for express,
    // hack-y now, will revisit later.
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    //       app.use(expressValidator());
    app.use(express.session({
        secret: 'shilalisababby' // <-- lol
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static('./public'));

    app.engine('hbs', hbs.express3({
        partialsDir: config.root + '/app/views/partials',
        contentHelperName: 'content',
    }));

    app.set('view engine', 'hbs');
    app.set('views', config.root + '/app/views');

    app.configure(function() {

        app.use(express.bodyParser());
        app.use(express.methodOverride());

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
