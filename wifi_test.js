var wifi = require("./wifi.js");
var bleData = require('./characteristics/wifi_data.js');
var ble = require('./phone_connect.js');

var events = require('events');



module.exports = function(){
	
	var eventEmitter = new events.EventEmitter();
	
	
	
	console.log("start wifi");

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
				ble.initialize();
			} else {
				console.log("reconnected!");
			}
			
		}, 12000);
		
	}

	bleData.emitter.on('newCreds', function(){
		
		console.log('try new creds');
		wifi.connect(bleData.newSSID,bleData.password);
		
		
		setTimeout(function(){ //wait for connection
			
			var connected = wifi.isConnected();
			console.log(connected);
		
			if(connected)
			{
				console.log("success");
				bleData.status = 0x01;
			} else {
				bleData.status = 0x03;
				console.log("Send failure to phone");
			}
			
		}, 12000);
		
		
	});

}
