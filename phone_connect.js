var bleno = null;
var events = require('./event_module.js');

var exports = module.exports = {
	
	
		
	initialize: function(){
		process.env['BLENO_DEVICE_NAME'] = 'WalkSmart Node';
		
		var led = require('./led');

		var bleData = require('./characteristics/wifi_data.js');
		
		bleno = require('bleno');

		var WifiService = require('./wifiservice');

		var service = new WifiService();

		console.log("start");
		
		var advertisingTimeout = setTimeout(function(){
			bleno.disconnect();
			bleno.stopAdvertising();
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
			if (bleData.status != 0x01)
			{
				bleno.startAdvertising('WalkSmart Node', [service.uuid]);
				led.setOn();
			} else {
				bleno.stopAdvertising(function(){
					console.log("stopped advertising");
				});
			}
		});

		bleno.on('connect',function(clientAddress){
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
		
	},
	
	disconnect : function(){
		bleno.disconnect();
		bleno.stopAdvertising();
	}


	

};
