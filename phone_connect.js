

var exports = module.exports = {
	
	
		
	initialize: function(){
		var bleno = require('bleno');

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
			bleno.stopAdvertising();
		});

		bleno.on('advertisingStart', function(error) {

		  console.log('on -> advertisingStart: ' +
			(error ? 'error ' + error : 'success')
		  );

		  if (!error) {

			bleno.setServices([
			  service
			]);
		  }
		});
		
	}


	

};
