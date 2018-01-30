var bleno = require('bleno');
var os = require('os');
var util = require('util');
var bleData = require('./wifi_data.js');

var BlenoCharacteristic = bleno.Characteristic;

var macCharacteristic = function() {

	 macCharacteristic.super_.call(this, {
		uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb0c',
		properties: ['read'],

		onReadRequest: function(offset,callback){
			var execSync = require('child_process').execSync;
			
			var message = execSync('sudo ifconfig wlan0').toString();
			
			var i = message.indexOf('HWaddr') + 7;
			
			var mac = message.substring(i,i+17);
			
			
			console.log("Read Request MAC: " + mac);
			var data = new Buffer(mac);
			var result = this.RESULT_SUCCESS;
			callback(result,data);
		}});

};


util.inherits(macCharacteristic, BlenoCharacteristic);
module.exports = macCharacteristic;
