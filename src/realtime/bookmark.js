module.exports = function(app, express, sessionStore) {	
	var io = require('socket.io'),
		sio = require('socket.io-sessions');

	var socket = sio.enable({
		socket: io.listen(app),
		store: sessionStore,
		parser: express.cookieParser()
	});

	var sessionConnections = {}
	socket.on('sconnection', function (client, session) {
		if(session.auth.facebook.user.username) {
			var username = session.auth.facebook.user.username;
			if(!sessionConnections[username]) {
				sessionConnections[username] = new Array();
				sessionConnections[username].push(client);
			} else {
				sessionConnections[username].push(client);
			}
		}

		client.on('addition', function (data, fn) {
			sessionConnections[session.auth.facebook.user.username].forEach(function(sock){
				sock.emit('bookmark', data);
			});
		});
	});
};