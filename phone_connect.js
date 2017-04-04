var bleno = null;

var exports = module.exports = {
	
	
		
	initialize: function(){
		process.env['BLENO_DEVICE_NAME'] = 'WalkSmart Node';
		
		var led = require('./led');
		
		bleno = require('bleno');

		var WifiService = require('./wifiservice');

		var service = new WifiService();

		console.log("start");
		
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
			bleno.startAdvertising('WalkSmart Node', [service.uuid]);
			led.setOn();
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
