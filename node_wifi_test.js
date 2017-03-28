var wifi = require('node-wifi');

wifi.init({iface : "wlan0"});

wifi.disconnect(function(err){
	if (err){
		console.log(err);
	} 
	console.log("Disconnected");
});


/*

wifi.scan(function(err,networks){
	if (err) {
		console.log(err);
	} else {
		console.log(networks);
		for (var i = 0; i < networks.length; i++)
		{
			if (networks[i].ssid == "TurtleIsland")
			connect();
		}
	}
});

*/



function connect(){
	wifi.connect({ssid:"TurtleIsland",password:"grandforks"},function(err){
		if (err){
			console.log(err);
		} 
		console.log("Connected");
	});
	
}

