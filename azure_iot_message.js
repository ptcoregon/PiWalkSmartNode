var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var events = require('./event_module.js');

var fs = require('fs');
var folder = '/home/pi/walk_objects/';

var client = null;

var createAttempts = 0;

var self = this;

module.exports = {
	
	initialize : function(){
		var self = this;
		var connectionString = 'HostName=WalkSmart-Node-Hub.azure-devices.net;DeviceId=myFirstNodeDevice;SharedAccessKey=CTSL5mlgnDhj6xB+XBYVIA1lun+85Xp5sFYGo5hcPH8=';
		client = clientFromConnectionString(connectionString);
		client.open(self.connectCallback);
		
	},
	
	printResultFor : function(op){
		return function printResult(err,res){
			if (err) console.log(op + ' error' + err.toString());
			if (res) console.log(op + ' success' + res.constructor.name);
		};
		
	},
	
	connectCallback : function(err){
		var self = this;
		if (err){
			console.log("Could not connect: " + err);
			createAttempts++;
			if (createAttempts > 1)
			{
				console.log("too many attempts");
				events.setQueueError();
			} else {
				console.log("try again");
				self.initialize();
			}
			
		} else {
			console.log("Client Connected");
			createAttempts = 0;
			events.setQueueReady();
			client.on('message',function(msg){
				console.log(msg.messageId + " " + msg.data);
				client.complete(msg,self.printResultFor('completed'));
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
		
		//obj = {"address": "C449C2FA3DB2", "rssi":-32, "rotations" : 11, "duration": 17, "year":17,"month":3,"day":19,"hour":7,"minute":13, "best10":100}
		
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
		
	}
	
}









