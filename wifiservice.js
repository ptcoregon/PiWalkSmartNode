var bleno = require('bleno');
var util = require('util');

var wifiStatusCharacteristic = require('./characteristics/wifiStatus');
var wifiSSIDCharacteristic = require('./characteristics/wifiSSID');
var wifiPasswordCharacteristic = require('./characteristics/wifiPassword');
var wifiNetworksCharacteristic = require('./characteristics/wifiNetworks');
var macCharacteristic = require('./characteristics/mac');



function WifiService() {
  var self = this;
  bleno.PrimaryService.call(this, {
    uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb07',
    characteristics: [
      new wifiStatusCharacteristic(),
      new wifiSSIDCharacteristic(),
      new wifiPasswordCharacteristic(),
      new macCharacteristic(),
      new wifiNetworksCharacteristic(),
      
    ]
  });
};

util.inherits(WifiService, bleno.PrimaryService);
module.exports = WifiService;

