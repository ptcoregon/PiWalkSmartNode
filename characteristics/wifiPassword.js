var bleno = require('bleno');
var os = require('os');
var util = require('util');
var bleData = require('./wifi_data.js');

var BlenoCharacteristic = bleno.Characteristic;

var wifiPasswordCharacteristic = function() {
	
	 bleData.password = "hi!";
	 

	 wifiPasswordCharacteristic.super_.call(this, {
		uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb09',
		properties: ['write'],
		onWriteRequest: function(data,offset,withoutResponse,callback){
			console.log("onWriteRequest");
			
			value =  data.toString('utf8');
			bleData.password = value;
			
			console.log(bleData.password);
			
			var result = this.RESULT_SUCCESS;
			callback(result);
		}
		
		
	});


};

util.inherits(wifiPasswordCharacteristic, BlenoCharacteristic);
module.exports = wifiPasswordCharacteristic;
