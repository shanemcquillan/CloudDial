exports.filterPublic = function(bookmarks) {
	var publics = new Array();
	for(var i = 0; i < bookmarks.length; i++) {
		if(!bookmarks[i].private) {
			publics.push(bookmarks[i]);
		}
	}
	return publics;
};