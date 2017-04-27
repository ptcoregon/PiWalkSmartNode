var geolocator = require("geolocator");

geolocator.config(
	{
		language:"en",
		google: {
			version: "3",
			key: "AIzaSyAZV8cqaraKBUEWiG2jCz-3uCrXUARFtfQ"
		}
			
	});
	
var options = {
	timezone:true,
	timeout:5000,
	addressLookup: false,
	staticMap : false,
	enableHighAccuracy: false
}

geolocator.locate(options,function(err,location){
	if (err) return console.log(err);
	console.log(location);
	
});
	
