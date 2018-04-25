var bleno = null;
var events = require('./event_module.js');

var exports = module.exports = {
	
	wifiList: [],
	
	wifiIndex: 0,
		
	initialize: function(){
		var self = this;
		
		process.env['BLENO_DEVICE_NAME'] = 'WalkSmart Node';
		
		var led = require('./led');

		var bleData = require('./characteristics/wifi_data.js');
		
		bleno = require('bleno');

		var WifiService = require('./wifiservice');

		var service = new WifiService();
		
		var events = require("./event_module.js");
		var w = require('./wifi.js');

		console.log("start");
		
		var advertisingTimeout = setTimeout(function(){
			bleno.disconnect();
			bleno.stopAdvertising();
			bleno = undefined;
			led.blink(0);
			events.startScanAnyway();
			
		},120000);
		
		bleno.on('stateChange', function(state) {
		  console.log('on -> stateChange: ' + state);

		  if (state === 'poweredOn') {
			bleno.startAdvertising('WalkSmart Node', [service.uuid]);
		  }
		  else {

			bleno.stopAdvertising();
		  }
		});

		bleno.on('disconnect',function(clientAddress){
			console.log("Disconnected from " + clientAddress);
			
			try{
				if (bleData.status != 0x01)
				{
					bleno.startAdvertising('WalkSmart Node', [service.uuid]);
					led.setOn();
				} else {
					bleno.stopAdvertising(function(){
						console.log("stopped advertising");
					});
				}
			} catch(e){
				console.log("start advertising error");
				console.log(e);
			}
		});

		bleno.on('accept',function(clientAddress){
			console.log("Connected to " + clientAddress);

			clearTimeout(advertisingTimeout);

			bleno.stopAdvertising(function(){
				console.log("stopped advertising");
			});
		});

		bleno.on('advertisingStart', function(error) {
			led.setOn();

		  console.log('on -> advertisingStart: ' +
			(error ? 'error ' + error : 'success')
		  );

		  if (!error) {

			bleno.setServices([
			  service
			]);
		  }
		});
		
		var networksChar = require("./characteristics/wifiNetworks.js");
		
		events.emitter.on("subscribed",function()
		{
			self.wifiList = [];
			self.wifiIndex = 0;
			console.log("Scan for Networks");
			w.scanNetworks().then(function(r){
				for(x in r){
					console.log(x);
					self.wifiList.push(x);
				}
				console.log("updateValue");
				events.updateValueCallback(new Buffer(self.wifiList[0]));
				self.wifiIndex = 1;
			});
			
		});
		
		events.emitter.on("ack",function(){
			console.log("ack event");
			console.log('wifi index: ' + self.wifiIndex + ', wifiList.length: ' + self.wifiList.length);
			if (self.wifiIndex < self.wifiList.length){
				var ssid = self.wifiList[self.wifiIndex];
				console.log('updateValue to ' + ssid);
				
				setTimeout(function(){
					events.updateValueCallback(new Buffer(ssid));
					self.wifiIndex = self.wifiIndex + 1;
					console.log('done');
				},100);
				
				
			}
			
			
		});
		
	},
	
	disconnect : function(){
		bleno.disconnect();
		bleno.stopAdvertising();
	}


	

};
