var azure = require('azure-storage');
var events = require('./event_module.js');

var store = require('json-fs-store')('/home/pi/PiWalkSmartNode/walk_objects');

var queueService = null;

var createAttempts = 0;

module.exports = {
	
	initialize : function(){
		var self = this;
		queueService = azure.createQueueService('walksmart1','ZwEU627jtc7HbKxmzWvovaepw99Y47jP4WrVcCqR/i0xwQNo2Q0uSHnWUkBQhWH6rXFNt5JUnJB1S5F2Mbso1w==');
		queueService.createQueueIfNotExists('pi-walk-items',function(error){
			if (!error){
				console.log("Queue Exists");
				events.setQueueReady();
				createAttempts = 0;
				self.addStoredData();
			} else {
				console.log("Create Queue Error: ");
				console.log(error);
				createAttempts++;
				if (createAttempts > 1)
				{
					events.setQueueError();
				} else {
					self.initialize();
				}
			}
		});
		
		
	},
	
	add : function(obj){
		
		storeObj = obj;
		
		storeObj.id = "" + obj.address + obj.rotations + obj.duration + obj.year + obj.month + obj.day + obj.hour + obj.minute;
		
		store.add(storeObj,function(err){
			if (err) throw err;
		});
		
		//this.addToQueue(obj);

	},
	
	addStoredData: function(){
		console.log("Adding stored data:");
		var self = this;
		store.list(function(error,objects){
			if (error){
				throw error;
			}
			
			var x = 0;
			
			events.emitter.once("connected",function()
			{
				console.log("exit addStoredData");
				return;
			});
			
			while(x < objects.length){
				var obj = objects[x];
				console.log(obj);
				self.addToQueue(obj);
				x++;		
			}
		});
		console.log("Done adding stored data.");
		return;
	},
	
	addToQueue: function(obj){
		var self = this;
		
		//obj = {"address": "C449C2FA3DB2", "rotations" : 11, "duration": 17, "year":17,"month":3,"day":19,"hour":7,"minute":13}
		
		message = JSON.stringify(obj);
		b64message = new Buffer(message).toString('base64');

		//console.log(message);
		var options = {'clientRequestTimeoutInMs':1800000};

		queueService.createMessage('pi-walk-items',b64message,options,function(error){
			if (!error){
				console.log("Successfully Added to Queue");
				addAttempts = 0;
				self.removeFromStore(obj);
				return true;
			} else {
				console.log('Create Queue Message Error: ');
				console.log(error);
				
				events.setQueueError();				
				
				
			}
		});

	},
	
	removeFromStore: function(obj){
		
		var id = "" + obj.address + obj.rotations + obj.duration + obj.year + obj.month + obj.day + obj.hour + obj.minute;
		
		store.remove(id,function(err){
			if (err) console.log(err);
		});
		
	}
	
}









