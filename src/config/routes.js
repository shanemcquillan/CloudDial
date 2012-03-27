var routes = require('../routes');

module.exports = function(app) {
	app.get('/', routes.home);
	app.get('/user/*', routes.account);
	app.get('/bookmarks', routes.searchbookmarks);
	app.post('/bookmark', routes.save.saveBookmark);
	app.get('/savescreen', routes.save.saveScreen);
	app.post('/group', routes.creategroup);
	app.get('*', routes.notfound);
}