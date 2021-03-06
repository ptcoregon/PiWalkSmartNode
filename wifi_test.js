var wifi = require("./wifi.js");
var bleData = require('./characteristics/wifi_data.js');
var ble = require('./phone_connect.js');
var led = require('./led');

var events = require('./event_module.js');

var reconnectingFlag = false;


module.exports = {
	
	
	setup : function(){
		var self = this;
		var emitter = this.emitter;
	
		console.log("start wifi");
		
		

		if (!wifi.isConnected()) //not connected
		{
			wifi.disconnect();
			wifi.reconnect();
			reconnectingFlag = true;
			setTimeout(function(){ //wait for reconnect
				reconnectingFlag = false;
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
				
			}, 20000);
			
		} else {
			//console.log(typeof emitter);
			events.setWifiConnected();
		}

		events.emitter.on('newCreds', function(){
			if (reconnectingFlag == false){
			
				bleData.status = 0x03;
				led.blink(200);
				console.log('try new creds');
				console.log(bleData.newSSID);
				console.log(bleData.password);
				
				wifi.connect(bleData.newSSID,bleData.password,0);
				reconnectingFlag = true;
				
				setTimeout(function(){ //wait for connection
					reconnectingFlag = false;
					var connected = wifi.isConnected();
					console.log(connected);
				
					if(connected)
					{
						
						console.log("success");
						bleData.status = 0x01;
						setTimeout(function(){
							ble.disconnect();
							events.setWifiConnected();
						},3000);
						
					} else {
						bleData.status = 0x05;
						console.log("Send failure to phone");
						led.setOn();
					}
					
				}, 15000);
			}
			
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
	},
	
	isConnected(){
		return wifi.isConnected();
	}
	
}
