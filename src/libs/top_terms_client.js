var net = require('net'),
		request = require('request'),
		jsdom = require('jsdom');

exports.getTopTerms = function(webpage, callback) {
	var client = net.connect(config.tw_port, function() { //'connect' listener
		console.log('client connected');
		request(webpage, function(error, response, body) {
			jsdom.env({
				html: body,
				scripts: [
					'http://code.jquery.com/jquery-1.5.min.js'
				]
			},
			function (err, window) {
				var $ = window.jQuery;
				client.write($('body').text());
			});
		});
	});

	client.on('data', function(data) {
		console.log(data);
		var str = data.toString();
		console.log(str);
		var tagsList = JSON.parse(str);
		console.log(tagsList);
		callback(tagsList.topterms);
		client.end();
	});

	client.on('end', function() {
		console.log('client disconnected');
	});
}