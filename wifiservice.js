var bleno = require('bleno');
var util = require('util');

var wifiStatusCharacteristic = require('./characteristics/wifiStatus');
var wifiSSIDCharacteristic = require('./characteristics/wifiSSID');
var wifiPasswordCharacteristic = require('./characteristics/wifiPassword');

function WifiService() {

  bleno.PrimaryService.call(this, {
    uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb07',
    characteristics: [
      new wifiStatusCharacteristic(),
      new wifiSSIDCharacteristic(),
      new wifiPasswordCharacteristic()
    ]
  });
};

util.inherits(WifiService, bleno.PrimaryService);
module.exports = WifiService;
