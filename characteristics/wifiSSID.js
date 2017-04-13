var bleno = require('bleno');
var os = require('os');
var util = require('util');
var bleData = require('./wifi_data.js');

var BlenoCharacteristic = bleno.Characteristic;

var wifiSSIDCharacteristic = function() {

	 wifiSSIDCharacteristic.super_.call(this, {
		uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb08',
		properties: ['read','write'],
		onWriteRequest: function(data,offset,withoutResponse,callback){
			console.log("onWriteRequest");
			value = data.toString('utf8');
			console.log(value);
			bleData.newSSID = value;
			console.log(bleData.newSSID);
			
			var result = this.RESULT_SUCCESS;
			callback(result);
		},
		onReadRequest: function(offset,callback){
			console.log("Read Request");
			var data = new Buffer(bleData.currentSSID);
			var result = this.RESULT_SUCCESS;
			callback(result,data);
		}

	});

};

util.inherits(wifiSSIDCharacteristic, BlenoCharacteristic);
module.exports = wifiSSIDCharacteristic;
