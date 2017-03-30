
var wifi = require('./wifi_test.js');
var bleData = require('./characteristics/wifi_data.js');
var execSync = require('child_process').execSync;

var queue = require('./azure_queue.js');
var events = require('./event_module.js');

var noble = null;

var connectionTimeout = null;

var currentPeripheral = null;

events.emitter.on("wifiConnected", function() //wait until wifi is connected
{
	queue.initialize();
		
});

events.emitter.on("queueReady",function(){
	
	noble = require('noble');
	
	var m = execSync('sudo hciconfig hci0 reset');
	console.log(m.toString('utf8'));
	
	startScan();

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
				
				noble.startScanning([],false,function(error){
					console.log(error);
				});
			});
			
	peripheral.once('connect',function(){
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
		console.log(error);
		console.log(peripheral.address);
		//console.log(characteristics);

		setupDataTransfer(characteristics);
	});
	
}

function setupDataTransfer(chars){
	
	var lastDataRead = new Buffer([0,0,0]);
	
	chars[0].on('read',function(data,isNotification){

				handleData(data);
				lastDataRead = data;
				console.log("Write");
				
				chars[1].write(data,false)
				
				
			});

	
	chars[1].on('write',function(){
		console.log("written");
		if (lastDataRead[0] == 0x3e)
		{
			disconnect();
		} else {
			setTimeout(function(){
				chars[0].read();
			},50);
		}
		
	});
	
	chars[1].write(new Buffer([1,1,1,1,1,1,1,1,1,1,1,1,1]),false)
}

function handleData(data){
	console.log(data);
	return;
}

wifi.setup(); //try to connect to wifi, and if it can't, start advertising on BLE



//setInterval(function(){
	//console.log("Going");
//},5000);
