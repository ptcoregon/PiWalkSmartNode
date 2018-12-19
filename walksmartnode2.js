var wifi = require('./wifi_test.js');

var led = require('./led.js');
var buzzer = require('./buzzer.js');
led.init();
buzzer.init();
var bleData = require('./characteristics/wifi_data.js');
var execSync = require('child_process').execSync;

var message = require('./azure_iot_message.js');
var events = require('./event_module.js');
var clock = require('./clock.js');

var moment = require('moment-timezone');

var noble;

var connectionTimeout = null;

var currentPeripheral = null;

var batteryLevel = null;

var data_service_uuid = '10';
var data_char_uuid = '100';

var live_data_service_uuid = '11';
var live_data_enabled_char_uuid = '111';

var info_service_uuid = '102';
var battery_char_uuid = '103';
var timezone_char_uuid = '2000';
var utc_char_uuid = '2001';

var timezone_object = {};
var live_data_object = {};

var lastImmediateWalkAlertSent = 0;

//parameters for shoe (walksmart wear) monitor
var WalkSmartWalkingTimestamp = Date.now();
var WearWalkingTimestamp = Date.now();
var firstDiscover = true;



events.emitter.on("wifiConnected", function() //wait until wifi is connected
{
	clock.update();
	
});

events.emitter.on("clockUpdated", function() //wait until clock is updated or confirmed
{
	console.log("initialize iot messaging");
	message.initialize();
	
});


events.emitter.on("queueReady",function(){
	
	
	
	noble = require('noble');
	
	var m = execSync('sudo hciconfig hci0 reset');
	//console.log(m.toString('utf8'));
	startScan();
	
	
  message.addStoredData();
	wifi.startChecks();
});

events.emitter.on("startScanAnyway",function(){
	noble = require('noble');
	
	var m = execSync('sudo hciconfig hci0 reset');
	//console.log(m.toString('utf8'));
	startScan();
});

events.emitter.once("queueError",function()
	{
		//if (currentPeripheral)
		//{
			//disconnect();
		//}
		
		//setTimeout(function(){
			//noble.stopScanning();
			//wifi.setup(); 
		//},1000);
		led.setOn();
		
		setTimeout(function(){
			console.log("queueError exit");
			process.exit();
		},2000);
		
	});
	

function startScan(){
	
	var m = execSync('sudo hciconfig hci0 reset');
	//console.log(m.toString('utf8'));
	
	console.log("Start the WalkSmart Scan");
	
	noble.on('scanStart', function(){
		console.log("started a scan");
		
	});
	
	noble.on('stateChange',function(state){
		console.log("Bluetooth State: " + state);
		if (state === "poweredOn")
		{
			led.blink(0);
			noble.startScanning([],true,function(error){
				if (error){
					console.log(error);
				}
			});
			
			noble.once('scanStop',function(){
				console.log("scan stopped");
				//startScan();	
			});
		}
	});
	
	//var m = execSync('sudo hciconfig hci0 reset');

	noble.on('discover',function(peripheral){
		
		if ((Date.now() - WearWalkingTimestamp) > 5000){
			//console.log('reset');
			WalkSmartWalkingTimestamp = Date.now();
			WearWalkingTimestamp = Date.now();
			firstDiscover = true;
		}
		
		
		
		var name = peripheral.advertisement.localName
		//console.log(name);
		if (name == "WalkSmart3" || name == "WalkWise")
		{
			console.log("found walksmart:" + peripheral.address);
			try{
				var data = peripheral.advertisement.serviceData;
				var first = data[0];
				var live_data_mode = first.data;
				
				var walking = live_data_mode["1"];
				
				var tipped = live_data_mode["3"];
				
				console.log("Walking: " + walking);
				console.log("Tipped: " + tipped);
				
				var address = peripheral.address.replace(/:/g,"").toUpperCase().trim();		
				var valid_address = message.walksmartAddresses.length == 0 || message.walksmartAddresses.indexOf(address) > -1;
				
				if (tipped){
					message.sendTippedAlarm(address);
					currentPeripheral = peripheral;
					
					noble.stopScanning();
					

					console.log("connect!");
					
					events.setConnected();
					connectToWalkSmart(peripheral);
				} else if (walking){
					console.log("Don't Connect!");
					
					if (valid_address){
						console.log("valid");
						WalkSmartWalkingTimestamp = Date.now();
					
						var diff = moment().diff(lastImmediateWalkAlertSent,'seconds');
						console.log(diff);
						if (diff > 120 && message.sendWalkAlarms){
							
							lastImmediateWalkAlertSent = moment();
							message.sendWalkAlarm(address);
						} else {
							console.log("Don't send walk alarm");
						}
						
						
					}
						
				} else if (wifi.isConnected() && message.iot_hub_connected && currentPeripheral == null) {
					currentPeripheral = peripheral;
					
					noble.stopScanning();
					

					console.log("connect!");
					
					events.setConnected();
					connectToWalkSmart(peripheral);
				}
			
			} catch (e){
				console.log(e);
				connectToWalkSmart(peripheral);
				
				events.setConnected();
				
				//noble.stopScanning();
			}
			
		} else if (name == "WalkSmartWear"){
			var address = peripheral.address.replace(/:/g,"").toUpperCase().trim();
			console.log("WalkSmartWear found");
			
			if (message.wearableAddresses.length == 0 || message.wearableAddresses.indexOf(address) > -1){
				console.log("valid");
				WearWalkingTimestamp = Date.now();
				if (firstDiscover){
					WalkSmartWalkingTimestamp = Date.now();
					firstDiscover = false;
				}
			}
			
			var difference = WearWalkingTimestamp - WalkSmartWalkingTimestamp;
		
			if (difference > 5000 && message.wearableAlarm){
				console.log("ALARM!!!!");
				WalkSmartWalkingTimestamp = Date.now();
				WearWalkingTimestamp = Date.now();
				firstDiscover = true;
				buzzer.buzz(3);
				setTimeout(function(){led.blink(0)},3000);
				//console.log("iot_hub_connected:" + message.iot_hub_connected);
				if (message.iot_hub_connected){
					console.log("send to server");
					message.sendWearableAlarm(address);
				}
			}
			
			
			
		}
		
		
		
	});
	
	noble.on('warning',function(message){
		console.log("Noble Warning: " + message);
		noble.stopScanning();
		startScan();
	});
	
}

function disconnect(){
	console.log("disconnecting...");
	
	try{
		currentPeripheral.disconnect();
	} catch(e){
		console.log(e);
	}
	
	
	
	currentPeripheral = null;
	this.batteryLevel = 0;
}

function connectToWalkSmart(peripheral){
	var self = this;
	peripheral.once('disconnect',function(){
				console.log("disconnected from walksmart");
				
				clearTimeout(self.connectionTimeout);
		
				currentPeripheral = null;
				self.batteryLevel = 0;

				led.blink(0);
				events.setDisconnected();
		
				var address = peripheral.address.replace(/:/g,"").toUpperCase().trim();
				
				console.log(address);
				console.log(timezone_object[address]);

				if (timezone_object[address] === undefined && address.length > 7){
					console.log("get timezone from server for " + address);
					getTimezoneFromServer(address);
				} else {
					console.log("no need to get timezone");	
				}
				
				noble.startScanning([],true,function(error){
					if (error) console.log("Start Scanning Error: " + error);
					message.addStoredData();
				});

				
			});
			
	peripheral.once('connect',function(){
		//1 minute connection Timeout
		clearTimeout(self.connectionTimeout);
 		self.connectionTimeout = setTimeout(function(){
 			led.blink(0);
 			//currentPeripheral = null;
			console.log("1 minute connection timeout disconnect 2");
			disconnect();
 			//process.exit();
 		},60000);
		
		led.blink(1000);
		currentPeripheral = peripheral;
		console.log("connected to WalkSmart");
		
		discoverServices(peripheral);
	});
	
	//4 minute connection Timeout
	clearTimeout(self.connectionTimeout);
	self.connectionTimeout = setTimeout(function(){
		led.blink(0);
		currentPeripheral = null;
		console.log("4 minute connection timeout exit");
		process.exit();
	},240000);
	
	peripheral.connect(function(error){
				if (error){
					console.log("Connect Error: " + error);
					disconnect();
          startScan();
				} else {
					console.log("Connected");
				}	
	});

}

function discoverServices(peripheral){
	
	console.log("discover services");

	var serviceUUIDs = [data_service_uuid,info_service_uuid,live_data_service_uuid];
	var characteristicUUIDs = [data_char_uuid,timezone_char_uuid,utc_char_uuid,battery_char_uuid,live_data_enabled_char_uuid];
	//peripheral.discoverAllServicesAndCharacteristics(function(error,services,characteristics){
	
	
	peripheral.discoverSomeServicesAndCharacteristics(serviceUUIDs,characteristicUUIDs,function(error,services,characteristics){
		console.log('discovered');
		if (error) {
			console.log('Discover Error:' + error);
			disconnect();
		} else {
			setupDataTransfer(peripheral,characteristics);
		}
		//console.log(peripheral.address);
		//console.log(characteristics);
		
		
		//getTZ(peripheral,characteristics);
	});
	
}

function getTZ(peripheral,chars) {
	console.log("getTZ");
	var tz_char = null;
	for (var i = 0; i < chars.length; i++){
		if (chars[i].uuid == timezone_char_uuid){
			tz_char = chars[i];
		}
	}
	
	tz_char.read(function(error,data){
		if (error){
			console.log(error);
			disconnect();
		} else {
			var array = [];
			for (var i = 0; i < 20; i++){
				var g = data[i];
				if (g > 0){
					console.log(g);
					array.push(g);
				}
			}
			
			var d = new Buffer(array);

			var timezone = d.toString();
			
			var address = peripheral.address.replace(/:/g,"").toUpperCase().trim();
			var new_timezone = timezone_object[address];
			
			console.log("Device timezone: " + timezone + " Server timezone: " + new_timezone);
			
			if (timezone !== new_timezone && new_timezone !== undefined){
				console.log("NOT THE RIGHT TIMEZONE!!!!");
				writeTZ(peripheral,chars,new_timezone);
			} else {
				console.log("Correct Timezone");
				setUTC(peripheral,chars,timezone);
			}
			
			
			
			
		}
	});
}

function writeTZ(peripheral,chars,timezone){
	console.log("writeTZ");
	var tz_char = null;
	for (var i = 0; i < chars.length; i++){
		if (chars[i].uuid == timezone_char_uuid){
			tz_char = chars[i];
		}
	}
	
	const tz = new Buffer(timezone, 'utf-8');
	
	tz_char.write(tz,false,function(error){
		if (error){
			console.log(err);
			disconnect();	
		} else {
			console.log("Wrote correct timezone");
			setUTC(peripheral,chars,timezone);
		}
		
	});
	
	
}

function getBatteryLevel(peripheral,chars){
	self = this;
	var battery_char = undefined;
	for (var i = 0; i < chars.length; i++){
		if (chars[i].uuid == battery_char_uuid){
			battery_char = chars[i];
		}
	}
	
	if (battery_char !== undefined){
		console.log("getBatteryLevel");
		battery_char.read(function(error,data){
			if (error){
				console.log("Error reading battery level");
				getLiveDataMode(peripheral,chars);
			} else {
				console.log(data[0]);
				console.log(data[1]);
				var level = (data[0]<<8) | data[1];
				console.log("Battery Level: " + level);
				if (level > 150 && level < 350){
					self.batteryLevel = level;
				}
				getLiveDataMode(peripheral,chars);
			}
		});
	} else {
		console.log("no battery char");
		self.batteryLevel = 0;
		getLiveDataMode(peripheral,chars);
	}
	
}

function getLiveDataMode(peripheral,chars){
	
	var address = peripheral.address.replace(/:/g,"").toUpperCase().trim();
	var live = live_data_object[address];
	
	//console.log("Device mode: " + timezone + " Server timezone: " + new_timezone);
			
	if (live !== undefined){
		self = this;
		var live_data_enabled_char = undefined;
		for (var i = 0; i < chars.length; i++){
			if (chars[i].uuid == live_data_enabled_char_uuid){
				live_data_enabled_char = chars[i];
			}
		}

		if (live_data_enabled_char !== undefined){
			console.log("get live_data_enabled_char");
			live_data_enabled_char.read(function(error,data){
				if (error){
					console.log("Error reading live data char");
					getTZ(peripheral,chars);
				} else {
					var enabled = data[0];
					console.log("mode: " + enabled + " server mode: " + live);
					if (enabled !== live){
						console.log("write live data mode");
						var d = 0;
						if (live == true || live == 'true'){
							var d = 1;	
						}
						const p = new Buffer([d], 'utf-8');
						live_data_enabled_char.write(p,false,function(error){
							if (error){
								console.log(err);
								disconnect();	
							} else {
								console.log("Wrote correct live data mode");
								getTZ(peripheral,chars);
							}
						});	
					} else {
						console.log("Correct Live Data Mode");
						getTZ(peripheral,chars);
					}
					
					
				}
			});
		} else {
			console.log("could not read live data char");
			getTZ(peripheral,chars);
		}	
		
		
	} else {
		getTZ(peripheral,chars);	
	}
	
}

function writeLiveDataMode(peripheral,chars,live){
	console.log("write live data");
	var tz_char = null;
	for (var i = 0; i < chars.length; i++){
		if (chars[i].uuid == timezone_char_uuid){
			tz_char = chars[i];
		}
	}
	
	
}

function setUTC(peripheral,chars,timezone){
	var now = moment().valueOf();
	//console.log(now);
	var tz = moment.tz.zone(timezone);
	//console.log(tz);
	var offset = tz.offset(now);
	offset = offset/60;
	//console.log(offset);
	
	console.log("offset: " + offset);
	var m = moment().unix();
	console.log(m);
	var array = [
		(m & 0xff000000) >> 24,
		(m & 0x00ff0000) >> 16,
		(m & 0x0000ff00) >> 8,
		(m & 0x000000ff),
		offset
	];
	var data = new Buffer(array);
	console.log(data);
	//console.log(chars[2]);
	var utc_char = undefined;
	for (var i = 0; i < chars.length; i++){
		if (chars[i].uuid == utc_char_uuid){
			utc_char = chars[i];
		}
	}
	
	utc_char.write(data,false,function(err){
		if (err) {
			console.log(err);
			disconnect();
		} else {
			console.log("unix written");
		}
	});
	
}

function setupDataTransfer(peripheral,chars){
	
	var lastDataRead = new Buffer([0,0,0]);
	
	var data_char = undefined;
	for (var i = 0; i < chars.length; i++){
		if (chars[i].uuid == data_char_uuid){
			data_char = chars[i];
		}
	}
	
	data_char.on('data',function(data,isNotification){
				console.log("Data Event");
				handleData(peripheral,data);
				if (data[0] == 0x3e)
				{
					//disconnect();
				} 

			});
			
	data_char.once('notify',function(state){
		console.log("notify: " + state);
		if (state == true)
		{	
			getBatteryLevel(peripheral,chars);
			//getTZ(peripheral,chars);
		}
	});
	
	data_char.subscribe(function(error){
		console.log("Subscribed");
			if (error) 
			{
				console.log("Subscribe Error");
				disconnect();
			}
		});
	
	
}

function handleData(device,data){
	//device is the name as peripheral
	var self = this;
	if (data[0] > 10 && data[0] < 50)
	{
	
		var year = data[0];
		var month = data[1];
		var day = data[2];
		var hour = data[3];
		var minute = data[4];
		
		var duration = (data[5] << 8) | (data[6] << 0);
		var rotations = (data[7] << 8) | (data[8] << 0);
		
		var best10 = data[9];
		
		var address = device.address.replace(/:/g,"").toUpperCase().trim();
		
		var rssi = device.rssi;
		
		//var obj = {"address": "C449C2FA3DB2", "rotations" : 11, "duration": 17, "year":17,"month":3,"day":19,"hour":7,"minute":13}
		var obj = {"address": address, "rssi":rssi, "rotations" : rotations, "duration": duration, "year":year,"month":month,"day":day,"hour":hour,"minute":minute,"best10":best10}
		
		message.add(obj);
		
		console.log(obj);
		
	} else if (data[0] > 110 && data[0] < 150) { //WE HAVE A CHECKING FROM NO DATA
		var year = (data[0] - 100)
		var month = data[1];
		var day = data[2];
		var hour = data[3];
		var minute = data[4];
		var duration = 0;
		var rotations = 0;
		var best10 = 0;
		var tipped = false;
		if (data[9] == 0xFE){
			tipped = true;	
		}
		var address = device.address.replace(/:/g,"").toUpperCase().trim();
		var rssi = device.rssi;
		var obj = {"address": address, "rssi":rssi, "rotations" : rotations, "duration": duration, "year":year,"month":month,"day":day,"hour":hour,"minute":minute,"best10":best10,"tipped":tipped,"batterylevel":self.batteryLevel}
		message.add(obj);
		console.log(obj);
		self.batteryLevel = 0;
	}
	
	if (data[10] > 10 && data[10] < 50)
	{
	
		var year = data[10];
		var month = data[11];
		var day = data[12];
		var hour = data[13];
		var minute = data[14];
		
		var duration = (data[15] << 8) | (data[16] << 0);
		var rotations = (data[17] << 8) | (data[18] << 0);
		
		var best10 = data[19];
		
		var address = device.address.replace(/:/g,"").toUpperCase().trim();
		
		var rssi = device.rssi;
		
		//var obj = {"address": "C449C2FA3DB2", "rotations" : 11, "duration": 17, "year":17,"month":3,"day":19,"hour":7,"minute":13}
		var obj = {"address": address, "rssi":rssi, "rotations" : rotations, "duration": duration, "year":year,"month":month,"day":day,"hour":hour,"minute":minute,"best10":best10}
		
		message.add(obj);

		console.log(obj);
	}
	
	
	
	return;
}

function getTimezoneFromServer(address){
	const https = require('https');

	https.get('https://walksmart1.azurewebsites.net/api/getTimezone?ZUMO-API-VERSION=2.0.0&address=' + address, (res) => {
	  console.log('statusCode:', res.statusCode);
	  var data = '';
	  res.on('data', (d) => {
		data += d;
	  	//process.stdout.write(d);
		//console.log(d);
	  });

	  res.on('end',function(){
		console.log(data);
		var x = JSON.parse(data);
		var address = x.id;
		var timezone = x.Timezone;
		var live = x.TherapyMode;
		timezone_object[address] = timezone;
		live_data_object[address] = live;
		console.log(address + " to " + timezone);
		console.log("live data is " + live);
	 });

	}).on('error', (e) => {
	  console.error(e);
	});	
}


wifi.setup(); //try to connect to wifi, and if it can't, start advertising on BLE


setInterval(function(){
	//console.log("Going");
	if (message.iot_hub_connected){
		message.sendNodeCheckin("still here");
	}
	
},(30*60000));

 setInterval(function(){
 	var m = moment();
 	if (m.minute() == 11){
 		led.blink(0);
		console.log("minute = 11 exit");
 		process.exit();
 	}
 },(60000));
