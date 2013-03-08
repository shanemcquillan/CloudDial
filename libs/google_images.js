var request = require('request');

exports.getImageUrls = function(searchTerms, callback) {
	var baseUri = "https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=";
	var endUri = "&rsz=8";
	var query = "";
	for(var i = 0; i < searchTerms.length; i++){
		query+=(searchTerms[i]+" ");
	}
	var imgUrls = new Array();
	if(query.length > 0) {
		var reqAddress = baseUri + encodeURI(query) + endUri;
		request(reqAddress, function(err, response, body) {
			var imgsObj = JSON.parse(body);
			for(var i = 0; i < imgsObj.responseData.results.length; i++) {
				imgUrls.push(imgsObj.responseData.results[i].unescapedUrl);
			}
			callback(err, imgUrls);
		});
	} else {
		callback(null, imgUrls);
	}
} 