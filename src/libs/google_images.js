var request = require('request');

exports.getImageUrls = function(query, callback) {
	var baseUri = "https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=";
	var endUri = "&rsz=8";
	var reqAddress = baseUri + encodeURI(query) + endUri;
	request(reqAddress, function(error, response, body) {
		var imgUrls = new Array();
		var imgsObj = JSON.parse(body);
		for(var i = 0; i < imgsObj.responseData.results.length; i++) {
			imgUrls.push(imgsObj.responseData.results[i].unescapedUrl);
		}
		callback(imgUrls);
	});
} 