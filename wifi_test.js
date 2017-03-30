var wifi = require("./wifi.js");

console.log("start");

if (!wifi.isConnected()) //not connected
{
	wifi.disconnect();
	wifi.reconnect();
	setTimeout(function(){ //wait for reconnect
		
		var connected = wifi.isConnected();
		console.log(connected);
	
		if(!connected) //if it doesn't reconnect
		{
			console.log("didn't reconnect");
			getSSIDandPassword();
		} else {
			console.log("reconnected!");
		}
		
	}, 8000);
	
}

function getSSIDandPassword(){
	
	
	wifi.connect("TurtleIsland","grandforks");
	
	
	setTimeout(function(){ //wait for connection
		
		var connected = wifi.isConnected();
		console.log(connected);
	
		if(connected)
		{
			console.log("Sent success to phone");
		} else {
			console.log("Send failure to phone");
		}
		
	}, 8000);
	
	
}
