exports.arrayToString = function(array) {
	var str = "";
	for(var i = 0; i < array.length; i++) {
		str+=(array[i]+" ");
	}
	return str;
}