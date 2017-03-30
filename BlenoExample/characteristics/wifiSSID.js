var bleno = require('bleno');
var os = require('os');
var util = require('util');

var BlenoCharacteristic = bleno.Characteristic;

var wifiSSIDCharacteristic = function() {

	 wifiSSIDCharacteristic.super_.call(this, {
		uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb09',
		properties: ['write'],
		onWriteRequest: function(data,offset,withoutResponse,callback){
			console.log("onWriteRequest");
			console.log(data.toString('utf8'));
			
			var result = this.RESULT_SUCCESS;
			callback(result);
		},

	});

};

util.inherits(wifiSSIDCharacteristic, BlenoCharacteristic);
module.exports = wifiSSIDCharacteristic;
