var user = require('../models/user.js');

module.exports = function(req, res) {
	user.addGroup(req.user._doc.username, req.body.name, function(){});
};
