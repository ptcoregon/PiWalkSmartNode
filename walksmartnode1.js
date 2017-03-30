
var wifi = require('./wifi_test.js');
var bleData = require('./characteristics/wifi_data.js');

var queue = require('./azure_queue.js');
var events = require('./event_module.js');

var noble = null;

var connectionTimeout = null;

events.emitter.on("wifiConnected", function() //wait until wifi is connected
{
	queue.initialize();
		
});

events.emitter.on("queueReady",function(){
	
	noble = require('noble');
	
	console.log("Start the WalkSmart Scan");
	
	noble.on('stateChange',function(state){
		console.log(state);
		if (state == "poweredOn")
		{
			noble.startScanning([],false,function(error){
				console.log(error);
			});
		}
	});



	noble.on('discover',function(peripheral){
		var name = peripheral.advertisement.localName
		console.log(name);
		if (name == "WalkSmart")
		{
			
			noble.on('scanStop',function(){
				console.log("scan stopped");
				peripheral.connect(function(error){
					console.log(error);
				});
			});
			
			noble.stopScanning();

			
		}
	});
	
	
});

function connectToWalkSmart(peripheral){
	
	//peripheral.once('disconnect',function(){
				//console.log("disconnected from walksmart");
				//noble.startScanning([],false,function(error){
					//console.log(error);
				//});
			//});
			
	peripheral.once('connect',function(){
		console.log("connected to WalkSmart");
		
		//connectionTimeout = setTimeout(function(){
			//peripheral.disconnect();
		//},8000);
		
		//discoverServices(peripheral);
	});
	
	peripheral.connect(function(error){
				console.log("connecting...");
				console.log(error);
				//console.log(error);

				//discoverServices(peripheral);
			});
}

function discoverServices(peripheral){
	
	console.log("discover services");
	
	var data_char_uuid = '00000100-0000-1000-8000-00805f9b34fb';
	var data_return_char_uuid = '00000101-0000-1000-8000-00805f9b34fb';
	var data_service_uuid = '00000010-0000-1000-8000-00805f9b34fb';
	
	var serviceUUIDs = [data_service_uuid];
	var characteristicUUIDs = [data_char_uuid,data_return_char_uuid];
	peripheral.discoverSomeServicesAndCharacteristics(serviceUUIDs,characteristicUUIDs, function(error,services,characteristics){
		console.log(characteristics);
		
	});
	
}

wifi.setup(); //try to connect to wifi, and if it can't, start advertising on BLE



//setInterval(function(){
	//console.log("Going");
//},5000);
