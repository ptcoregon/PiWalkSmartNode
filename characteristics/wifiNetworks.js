var bleno = require('bleno');
var os = require('os');
var util = require('util');
var bleData = require('./wifi_data.js');
var events = require('../event_module.js');

var BlenoCharacteristic = bleno.Characteristic;

var wifiNetworksCharacteristic = function() {

	 wifiNetworksCharacteristic.super_.call(this, {
		uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb0b',
		properties: ['indicate'],

		onSubscribe: function(maxValueSize,updateValueCallback){
			console.log("Subscribed");
			events.setSubscribed(updateValueCallback);
			console.log(updateValueCallback);
	
			
		},
		
		onIndicate: function(){
			console.log("onIndicate");
			events.setAckReceived();
		}
		
		});
	

};


util.inherits(wifiNetworksCharacteristic, BlenoCharacteristic);
module.exports = wifiNetworksCharacteristic;

