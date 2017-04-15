
var wifi = require('./wifi_test.js');
var led = require('./led.js');
led.init();
var bleData = require('./characteristics/wifi_data.js');
var execSync = require('child_process').execSync;

var queue = require('./azure_queue.js');
var updateQueue = require('./azure_queue_updates.js');
var events = require('./event_module.js');

var noble = null;

var connectionTimeout = null;

var currentPeripheral = null;


events.emitter.on("wifiConnected", function() //wait until wifi is connected
{
	updateQueue.initialize();
	queue.initialize();
	
});


events.emitter.on("queueReady",function(){
	
	noble = require('noble');
	
	var m = execSync('sudo hciconfig hci0 reset');
	console.log(m.toString('utf8'));
	
	startScan();
	
	wifi.startChecks();
	
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
			process.exit();
		},2000);
		
	});


});

function startScan(){
	
	var m = execSync('sudo hciconfig hci0 reset');
	console.log(m.toString('utf8'));
	
	console.log("Start the WalkSmart Scan");
	
	noble.on('scanStart', function(){
		console.log("something started a scan");
	});
	
	noble.on('stateChange',function(state){
		console.log(state);
		if (state == "poweredOn")
		{
			led.blink(0);
			noble.startScanning([],false,function(error){
				console.log(error);
			});
		}
	});

	noble.on('discover',function(peripheral){
		var name = peripheral.advertisement.localName
		//console.log(name);
		if (name == "WalkSmart2")
		{
			console.log("found walksmart");
			events.setConnected();
			noble.once('scanStop',function(){
				console.log("scan stopped");
				connectToWalkSmart(peripheral);
			});
			
			noble.stopScanning();

			
		}
	});
	
}

function disconnect(){
	currentPeripheral.disconnect();
	
}

function connectToWalkSmart(peripheral){
	
	peripheral.once('disconnect',function(){
				console.log("disconnected from walksmart");
				
				var m = execSync('sudo hciconfig hci0 reset');
				console.log(m.toString('utf8'));
				led.blink(0);
				events.setDisconnected();
				noble.startScanning([],false,function(error){
					if (error) console.log(error);
					queue.addStoredData();
				});
				
			});
			
	peripheral.once('connect',function(){
		led.blink(1000);
		currentPeripheral = peripheral;
		console.log("connected to WalkSmart");
		
		
		
		//connectionTimeout = setTimeout(function(){
			//peripheral.disconnect();
		//},8000);
		
		discoverServices(peripheral);
	});
	
	peripheral.connect(function(error){
				console.log(error);
			});
}

function discoverServices(peripheral){
	
	console.log("discover services");
	
	//var data_char_uuid = '0000010000001000800000805f9b34fb';
	//var data_return_char_uuid = '0000010100001000800000805f9b34fb';
	//var data_service_uuid = '0000001000001000800000805f9b34fb';
	
	var data_char_uuid = '100';
	var data_return_char_uuid = '101';
	var data_service_uuid = '10';
	
	
	var serviceUUIDs = [data_service_uuid];
	var characteristicUUIDs = [data_char_uuid,data_return_char_uuid];
	peripheral.discoverSomeServicesAndCharacteristics(serviceUUIDs,characteristicUUIDs,function(error,services,characteristics){
		if (error) console.log(error);
		//console.log(peripheral.address);
		//console.log(characteristics);
		
		setupDataTransfer(peripheral,characteristics);
	});
	
}

function setupDataTransfer(peripheral,chars){
	
	var lastDataRead = new Buffer([0,0,0]);
	
	chars[0].on('data',function(data,isNotification){
				console.log("Data Event");
				handleData(peripheral,data);
				if (data[0] == 0x3e)
				{
					disconnect();
				} 

				
				//chars[1].write(data,false)
				
				
			});
			
	chars[0].once('notify',function(state){
		console.log("notify: " + state);
		if (state == true)
		{
			chars[1].write(new Buffer([1,1,1,1,1,1,1,1,1,1,1,1,1]),false);
		}
	});

	
	chars[1].on('write',function(){
		console.log("written");
		/*
		if (lastDataRead[0] == 0x3e)
		{
			disconnect();
		} else {
			
			setTimeout(function(){
				chars[0].read();
			},50);
			
		}
		* */
		
	});
	
	chars[0].subscribe(function(error){
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
		
		var address = device.address.replace(/:/g,"").toUpperCase().trim();
		
		//var obj = {"address": "C449C2FA3DB2", "rotations" : 11, "duration": 17, "year":17,"month":3,"day":19,"hour":7,"minute":13}
		var obj = {"address": address, "rotations" : rotations, "duration": duration, "year":year,"month":month,"day":day,"hour":hour,"minute":minute}
		
		queue.add(obj);
		
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
		
		var address = device.address.replace(/:/g,"").toUpperCase().trim();
		
		//var obj = {"address": "C449C2FA3DB2", "rotations" : 11, "duration": 17, "year":17,"month":3,"day":19,"hour":7,"minute":13}
		var obj = {"address": address, "rotations" : rotations, "duration": duration, "year":year,"month":month,"day":day,"hour":hour,"minute":minute}
		
		queue.add(obj);
		
		console.log(obj);
	}
	
	
	
	return;
}

wifi.setup(); //try to connect to wifi, and if it can't, start advertising on BLE



setInterval(function(){
	//console.log("Going");
	updateQueue.getPackageVersion();
},(10*60000));
