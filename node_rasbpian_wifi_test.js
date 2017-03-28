var wifi = require('node-raspbian-wifi');

/*

wifi.resetWifi(function(error){
	console.log(error);
});
* 
*/



var options = {ssid:"TurtleIsland",passphrase:"grandforks"};

wifi.connectToWifi(options,function(error){
	console.log("Connect Error: ");
	console.log(error);
	
	wifi.getCurrentWifiSettings(function(error,data){
		console.log("Get Current Wifi Settings");

			console.log(JSON.stringify(data));

			console.log(error);
		
	});
});




