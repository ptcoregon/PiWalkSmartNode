var azure = require('azure-storage');
var events = require('./event_module.js');

//var store = require('json-fs-store')('/walk_objects');
var fs = require('fs');
var folder = '/walk_objects/';

var queueService = null;

var createAttempts = 0;

//var objects = null;

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
		
		
		var filename = storeObj.id  + '.json';

		fs.writeFile(folder + filename,JSON.stringify(storeObj),function(error){
			if (error) {console.log(error)};
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
			if (error) {console.log(error)};
			files.forEach(function(file){
				console.log(file);
				fs.readFile(folder + file,'utf-8',function(error,data){
					if (error) console.log(error);
					if (data) {
						console.log(data);
						try {
							var obj = JSON.parse(data);
							console.log("adding to queue: " + obj.rotations);
							self.addToQueue(obj);
						} 
						catch (e) {
							console.log(e);
							
							fs.unlink(folder + file, function(err){
								console.log(err);
							});
						}
						//self.addStoredData2(data,0);
						
						
					} else {
						fs.unlink(folder + file, function(err){
							console.log(err);
						});
					}
					
				});
			});
		});
		
		
		//store.list(function(error,store_objects){
			//if (error){
					//console.log("List Error");
					//console.log(error);
					
					//var f = error.match("/walk_objects/(.*).json");
					
					//store.remove(f,function(err){
						//if (err) console.log("Remove Error: " + err);
					//});
				//}
			////objects = store_objects;
			//if (store_objects && store_objects.length > 0)
			//{
				//console.log("Add stored data 2");
				//self.addStoredData2(store_objects,0);
			//}
		//});


	},
	
	//~ addStoredData2: function(objects,index){
		//~ var self = this;
		//~ var con = events.isConnected();
		//~ //console.log(con);
		//~ if (con == false)
		//~ {
				//~ 
			//~ if (objects.length == 0)
			//~ {
				//~ events.setNoMoreStoredWalks(true);
			//~ } else {
				//~ var obj = objects[index];
				//~ console.log("adding to queue: " + obj.rotations);
				//~ self.addToQueue(obj);
				//~ 
				//~ if ((index + 1) < objects.length)
				//~ {
					//~ setTimeout(function(){
						//~ self.addStoredData2(objects,index+1);
					//~ },50);
				//~ }
			//~ }
		//~ }
		//~ 
		//~ 
		//~ 
	//~ },
	
	addToQueue: function(obj){
		var self = this;
		
		
		//obj = {"address": "C449C2FA3DB2", "rotations" : 11, "duration": 17, "year":17,"month":3,"day":19,"hour":7,"minute":13}
		
		message = JSON.stringify(obj);
		b64message = new Buffer(message).toString('base64');

		//console.log(message);
		var options = {'clientRequestTimeoutInMs':1800000,'maximumExecutionTimeInMs':180000};

		queueService.createMessage('pi-walk-items',b64message,options,function(error){
			if (!error){
				console.log("Successfully Added to Queue: " + obj.rotations);
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
		
		//var id = "" + obj.address + obj.rotations + obj.duration + obj.year + obj.month + obj.day + obj.hour + obj.minute;
		
		//store.remove(id,function(err){
		//	if (err) console.log(err);
		//});
		
		var file = obj.id + '.json';
		
		fs.unlink(folder + file, function(err){
			console.log(err);
		});
		
	}
	
}









