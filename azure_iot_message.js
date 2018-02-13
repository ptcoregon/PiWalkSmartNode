var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var events = require('./event_module.js');

var update = require('./update.js');

var execSync = require('child_process').execSync;
var moment = require('moment-timezone');


//var self = require('./azure_iot_message.js');

var fs = require('fs');
var folder = '/home/pi/walk_objects/';

var authFile = '/boot/iot-tokens.json';

var client = null;

var createAttempts = 0;



//var self = this;

//var DeviceId = 'myFirstNodeDevice';
//var SharedAccessKey = 'CTSL5mlgnDhj6xB+XBYVIA1lun+85Xp5sFYGo5hcPH8=';

var DeviceId;

var self = module.exports = {
	

	sendWalkAlarms : false,

	iot_hub_connnected: false,

	
	initialize : function(){
		var self = this;
		
		fs.readFile(authFile,'utf-8',function(err,data){
			if (err){
				console.log(err);
			} else {
				try {
					console.log(data);
					var obj = JSON.parse(data);
					DeviceId = obj.DeviceId;
					console.log(DeviceId);
					
					console.log("initializing iot messaging");
					var connectionString = 'HostName=WalkSmart-Node-Hub.azure-devices.net;DeviceId=' + obj.DeviceId + ';SharedAccessKey=' + obj.SharedAccessKey;
					client = clientFromConnectionString(connectionString);
					client.open(self.connectCallback);
				} catch (e) {
					throw e;
				}
			}
			
		});
		
		
		
		
	},
	
	connectCallback : function(err){
		//var self = this;
		if (err){
			console.log("Could not connect: " + err);
			createAttempts++;
			self.iot_hub_connnected = false;
			if (createAttempts > 1)
			{
				console.log("too many attempts");
				events.setQueueError();
			} else {
				console.log("try again");
				events.setWifiConnected();
			}
			
		} else {
			console.log("Client Connected");
			self.iot_hub_connnected = true;
			self.sendNodeCheckin("Connected");

			createAttempts = 0;
			events.setQueueReady();
			
			client.getTwin(function(err,twin){
				if (err){
					console.log(err);
				} else {
					try{
						console.log(twin.properties.desired);
						if (twin.properties.desired.walkAlarm == true){
							console.log("Turn on immediate walk alarms");
							self.sendWalkAlarms = true;
						}
					} catch(e){
						console.log("no twin property");
					}
				}
				
			});
			
			
			client.on('message',function(msg){
				var newVersion = msg.data;
				try {
					var command = msg.properties.propertyList[0].value;
					console.log(command);
					var m = execSync(command);
					console.log(m.toString());
					self.sendNodeCheckin(m.toString());
					
				} catch (e){
					console.log("No Command");
				}
				console.log("New Message:" + newVersion);
				
				if (newVersion == "pull"){
					update.update();	
				} else if (newVersion == "reboot"){
					 execSync('sudo reboot');
				} else if (newVersion == "restart"){
					console.log("RESTART");
					 process.exit();
				} else {
					update.compareVersions(newVersion);

					//console.log("" + msg.data + " update: " + msg.properties.propertyList[0].value);
					console.log(JSON.stringify(msg));
					client.complete(msg,function(err,res){
						if (err) console.log('error: ' + err.toString());
						if (res) console.log('success: ' + res.constructor.name);
					});
				}
			});
			
			//var data = JSON.stringify([{'hello':'test'}]);
			//var message = new Message(data);
			//console.log("Sending message");
			//client.sendEvent(message,function(error){
				//if (error) {console.log(error);} else {
					//console.log("SENT!!!");
					//events.setQueueReady();
				//}
				
			//});
		}
	},
	
	add : function(obj){
		
		console.log("add to file");
		
		storeObj = obj;
		storeObj.serial = DeviceId;
		
		storeObj.id = "" + obj.address + obj.rotations + obj.duration + obj.year + obj.month + obj.day + obj.hour + obj.minute;
		
		
		var filename = storeObj.id  + '.json';

		fs.writeFile(folder + filename,JSON.stringify(storeObj),function(error){
			if (error) {console.log("write to file error: " + error);
			} else {
				console.log("wrote to file"); 
			}
		});
		
		
		//store.add(storeObj,function(err){
		//	if (err) console.log(err);
		//});
		
		//this.addToQueue(obj);

	},
	
	addStoredData: function(){
		console.log("Adding stored data:");
		var self = this;
		
		fs.readdir(folder,function(error,files){
			if (error) {console.log(error);}
			else {
				files.forEach(function(file){
					console.log(file);
					fs.readFile(folder + file,'utf-8',function(error,data){
						if (error) console.log(error);
						if (data) {
							console.log(data);
							try {
								var obj = JSON.parse(data);
								console.log("adding to message: " + obj.rotations);
								self.addToMessage(obj);
							} 
							catch (e) {
								console.log(e);
								
								fs.unlink(folder + file, function(err){
									console.log(err);
								});
							}
							
							
						} else {
							fs.unlink(folder + file, function(err){
								console.log(err);
							});
						}
						
					});
				});
			}
		});
		
	},
	
	addToMessage : function(obj){
		var self = this;
		
		
		//obj = {"address": "C449C2FA3DB2", "rssi":-32, "rotations" : 11, "duration": 17, "year":17,"month":3,"day":19,"hour":7,"minute":13, "best10":100,"serial":DeviceId}
		
		var m = JSON.stringify(obj);
		
		//m = '[' + m + ']';
		
		var message = new Message(m);
		
		console.log("Sending Message");
		
		client.sendEvent(message,function(error,res){
			if (!error){
				console.log("Successfully Added: " + obj.rotations);
				addAttempts = 0;
				self.removeFromStore(obj);
				return true;
			} else {
				console.log('Create Message Error: ');
				console.log(error);
				
				events.setQueueError();				
				
			}
		});

	},
	
	removeFromStore: function(obj){
		
		//var id = "" + obj.address + obj.rotations + obj.duration + obj.year + obj.month + obj.day + obj.hour + obj.minute;
		
		//store.remove(id,function(err){
		//	if (err) console.log(err);
		//});
		
		var id = obj["id"];
		
		//console.log("remove " + JSON.stringify(obj));
		
		var file = id + '.json';
		
		console.log("remove file: " + file);
		
		fs.unlink(folder + file, function(err){
			if(err) console.log(err);
		});
		
	},
	
	sendNodeCheckin: function(text){
		
		var serialBuffer = execSync("cat /proc/cpuinfo | grep Serial | cut -d ' ' -f 2");
		var serial = serialBuffer.toString();
		serial = serial.replace(/\n/g,'');
		var now = moment().toISOString();
		
		if (text == null || text == undefined){
			text = "";
		}
		
		var obj = {"serial":DeviceId,"timestamp":now,"address":0,"message":text};
		
		var m = JSON.stringify(obj);
		
		//m = '[' + m + ']';
		
		var message = new Message(m);
		
		console.log("Sending Node Checkin");
		
		client.sendEvent(message,function(error,res){
			if (!error){
				console.log("Successfully Sent Node Checkin");
				
			} else {
				console.log('Send Checkin Error: ');
				console.log(error);
				events.setQueueError();				
				
			}
		});
	},
	
	sendWalkAlarm: function(address){
		var obj = {"address":address,"walkalarm":"true"};
		var m = JSON.stringify(obj);
		var message = new Message(m);
		console.log("Sending Alarm");
		client.sendEvent(message,function(error,res){
			if (!error){
				console.log("Successfully Sent Alarm");
				return true;
			} else {
				console.log('Send Alarm Error: ');
				console.log(error);
				events.setQueueError();				
				
			}
		});
	}
	
}









