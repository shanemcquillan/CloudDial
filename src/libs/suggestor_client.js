var net = require('net');

exports.callSuggestor = function(page, callback) {
	var client = net.connect(config.sugg_port, function() {
		if(page) {
			client.end(JSON.stringify(page), 'utf8');
		} else {
			callback(null, {summary: '', topterms: new Array()});
		}
	});

	client.on('data', function(data) {
		var str = data.toString();
		var suggestions = JSON.parse(str);
		callback(null, suggestions);
	});

	client.on('error', function() {
		callback(null, { summary: '', topterms: new Array() });
		client.destroy();
	});

	client.setTimeout(5000, function() {
		callback(null, { summary: '', topterms: new Array() });
	});
}