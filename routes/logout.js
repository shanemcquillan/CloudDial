var user = require('../models/user.js');

module.exports = function(req, res, next) {
  req.logout();
  res.clearCookie('connect.sid');
  req.session.destroy(function() {});
  res.redirect('/');
}