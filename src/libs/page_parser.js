var request = require('request'),
	jsdom = require('jsdom'),
	Diffbot = require('diffbot').Diffbot;

var diffbot = new Diffbot(config.diffbot_id);

exports.getPage = function(address, callback) {
	diffbot.article({'uri': address, 'summary': true}, function(err, response){
		if(!response.error) {	//If diffbot is successful
			callback(err, { title: response.title, body: response.text, summary: response.summary, media: response.media });
		} else {	//Extract body and send all
			try {
				request(address, function(err, response, body) {
					if(body) {
						jsdom.env({
							html: body,
							scripts: [
								'http://code.jquery.com/jquery-1.5.min.js'
							]
						},
						function (err, window) {
							var $ = window.jQuery;
							callback(err, { title: $('title').text(), body: $('body').text() });
						});
					} else {
						callback(err, body);
					}
				});
			} catch(err) {
				callback(err, undefined);				
			}
		}
	});
}