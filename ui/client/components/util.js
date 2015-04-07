(function() {

	var x = window;
	
	x.trim = function(str, length) {
		//trim the string to the maximum length
		var trimmed = str.substr(0, length);
		//re-trim if we are in the middle of a word
		trimmed = trimmed.substr(0, 
				Math.min(trimmed.length, trimmed.lastIndexOf(" ")));
		if(trimmed.length < str.length) {
			trimmed += "...";
		}
		return trimmed;
	}
	
})();