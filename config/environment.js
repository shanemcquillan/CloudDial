module.exports = function(app, express, passport, sessionStore) {
	app.configure(function(){
		app.set('views', __dirname + '/../views');
		app.set('view engine', 'jade');
		app.use(express.logger());
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.cookieParser());
		app.use(express.session({ secret: 'cdsecret', store: sessionStore }));
		app.use(passport.initialize());
		app.use(passport.session());
		app.use(express.static(__dirname + '/../public'));
		app.use(app.router);

	});

	app.configure('development', function(){
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});

	app.configure('production', function(){
		app.use(express.errorHandler()); 
	});
};