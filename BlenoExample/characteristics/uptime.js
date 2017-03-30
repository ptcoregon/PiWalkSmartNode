var bleno = require('bleno');
var os = require('os');
var util = require('util');

var BlenoCharacteristic = bleno.Characteristic;

var UptimeCharacteristic = function() {

 UptimeCharacteristic.super_.call(this, {
    uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb09',
    properties: ['read','write'],
    onWriteRequest: function(data,offset,withoutResponse,callback){
	console.log("onWriteRequest");
	console.log(data);
	
	var result = this.RESULT_SUCCESS;
	callback(result);
    },
    onReadRequest: function(offset,callback){
	console.log("Read Request");
	var data = new Buffer([0x02, 0x05, 0x07]);
	var result = this.RESULT_SUCCESS;
	callback(result,data);
    }});

 this._value = new Buffer([0x01, 0x05, 0x07]);
};



//UptimeCharacteristic.prototype.onReadRequest = function(offset, callback) {
//	console.log("onReadRequest");
//
//  if(!offset) {
//
//    this._value = new Buffer(JSON.stringify({
//      'uptime' : os.uptime()
//    }));
//  }
//
//  console.log('UptimeCharacteristic - onReadRequest: value = ' +
//    this._value.slice(offset, offset + bleno.mtu).toString()
//  );
//
//  callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
//};

util.inherits(UptimeCharacteristic, BlenoCharacteristic);
module.exports = UptimeCharacteristic;
