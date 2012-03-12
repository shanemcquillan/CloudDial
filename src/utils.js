exports.filterPublic = function(bookmarks) {
	var publics = new Array();
	for(var i = 0; i < bookmarks.length; i++) {
		if(!bookmarks[i].private) {
			publics.push(bookmarks[i]);
		}
	}
	return publics;
};

exports.arrayToString = function(array) {
	var str = "";
	for(var i = 0; i < array.length; i++) {
		str+=(array[i]+" ");
	}
	return str;
}