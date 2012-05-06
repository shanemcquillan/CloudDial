exports.arrayToString = function(array) {
	var str = "";
	for(var i = 0; i < array.length; i++) {
		str+=(array[i]+" ");
	}
	return str;
};

exports.getMaxIndex = function(array) {
	var maxIndex = 0;
	for(var i = 1; i < array.length; i++) {
		if(array[i] > array[maxIndex])
			maxIndex = i;
	}
	return maxIndex;
};