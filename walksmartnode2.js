var wifi = require('./wifi_test.js');

var led = require('./led.js');
var buzzer = require('./buzzer.js');
led.init();
buzzer.init();
var bleData = require('./characteristics/wifi_data.js');
var execSync = require('child_process').execSync;

var message = require('./azure_iot_message.js');
var events = require('./event_module.js');

var moment = require('moment-timezone');

var noble;

var connectionTimeout = null;

var currentPeripheral = null;


var lastImmediateWalkAlertSent = 0;

//parameters for shoe (walksmart wear) monitor
var WalkSmartWalkingTimestamp = Date.now();
var WearWalkingTimestamp = Date.now();
var firstDiscover = true;



events.emitter.on("wifiConnected", function() //wait until wifi is connected
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
		if (name == "WalkSmart3")
		{
			console.log("found walksmart:" + peripheral.address);
			try{
				var data = peripheral.advertisement.serviceData;
				var first = data[0];
				var live_data_mode = first.data;
				
				var walking = live_data_mode["1"];
				
				console.log("Walking: " + walking);
				
				if (walking){
					console.log("Don't Connect!");
					
					var address = peripheral.address.replace(/:/g,"").toUpperCase().trim();
					
					var valid_address = message.walksmartAddresses.length == 0 || message.walksmartAddresses.indexOf(address) > -1;
					
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
	
}

function connectToWalkSmart(peripheral){
	var self = this;
	peripheral.once('disconnect',function(){
				console.log("disconnected from walksmart");
				
				clearTimeout(self.connectionTimeout);
		
				currentPeripheral = null;

				led.blink(0);
				events.setDisconnected();
				
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
	
	var data_char_uuid = '100';

	var data_service_uuid = '10';
	
	var info_service_uuid = '102';
	var timezone_char_uuid = '2000';
	var utc_char_uuid = '2001';
	
	
	var serviceUUIDs = [data_service_uuid,info_service_uuid];
	var characteristicUUIDs = [data_char_uuid,timezone_char_uuid,utc_char_uuid];
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
	chars[1].read(function(error,data){
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
			console.log(timezone);
			var now = moment().valueOf();
			//console.log(now);
			var tz = moment.tz.zone(timezone);
			//console.log(tz);
			var offset = tz.offset(now);
			offset = offset/60;
			//console.log(offset);
			setUTC(peripheral,chars,offset);
		}
	});
}

function setUTC(peripheral,chars,offset){
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
	chars[2].write(data,false,function(err){
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
	
	chars[0].on('data',function(data,isNotification){
				console.log("Data Event");
				handleData(peripheral,data);
				if (data[0] == 0x3e)
				{
					//disconnect();
				} 

			});
			
	chars[0].once('notify',function(state){
		console.log("notify: " + state);
		if (state == true)
		{
			getTZ(peripheral,chars);
		}
	});
	
	chars[0].subscribe(function(error){
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
		var address = device.address.replace(/:/g,"").toUpperCase().trim();
		var rssi = device.rssi;
		var obj = {"address": address, "rssi":rssi, "rotations" : rotations, "duration": duration, "year":year,"month":month,"day":day,"hour":hour,"minute":minute,"best10":best10}
		message.add(obj);
		console.log(obj);
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
