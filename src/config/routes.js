var routes = require('../routes');

module.exports = function(app) {
	app.get('/', routes.home);
	app.get('/user/*', routes.account);
	app.post('/save', routes.save.saveBookmark);
	app.get('/savescreen', routes.save.saveScreen);
	app.get('*', routes.notfound);
}