var wifi = require("./wifi.js");
var bleData = require('./characteristics/wifi_data.js');
var ble = require('./phone_connect.js');
var led = require('./led');

var events = require('./event_module.js');

module.exports = { 
	
	
	setup : function(){
		
		var emitter = this.emitter;
	
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
					led.setOn();
					ble.initialize();
					
				} else {
					console.log("reconnected!");
					events.setWifiConnected();
				}
				
			}, 12000);
			
		} else {
			console.log(typeof emitter);
			events.setWifiConnected();
		}

		events.emitter.on('newCreds', function(){
			led.blink(200);
			console.log('try new creds');
			wifi.connect(bleData.newSSID,bleData.password);
			
			
			setTimeout(function(){ //wait for connection
				
				var connected = wifi.isConnected();
				console.log(connected);
			
				if(connected)
				{
					ble.disconnect();
					console.log("success");
					bleData.status = 0x01;
					events.setWifiConnected();
				} else {
					bleData.status = 0x05;
					console.log("Send failure to phone");
					led.setOn();
				}
				
			}, 12000);
			
			
		});

	},
	
	startChecks(){
		//check network connection every 30 seconds
		setInterval(function(){
			if (!wifi.isConnected()) //not connected
			{
				if (!wifi.isConnected()) //not connected
				{
					console.log("Wifi Disconnected!");
					events.setQueueError();
				}
			}
		},30000);
	}
}
