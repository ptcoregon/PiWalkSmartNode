var bleno = require('bleno');
var os = require('os');
var util = require('util');

var BlenoCharacteristic = bleno.Characteristic;

var wifiStatusCharacteristic = function() {

	 wifiStatusCharacteristic.super_.call(this, {
		uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb09',
		properties: ['read'],

		onReadRequest: function(offset,callback){
			console.log("Read Request");
			var data = new Buffer([0x01]);
			var result = this.RESULT_SUCCESS;
			callback(result,data);
		}});

	 this._value = new Buffer([0x00]);
};


util.inherits(wifiStatusCharacteristic, BlenoCharacteristic);
module.exports = wifiStatusCharacteristic;
