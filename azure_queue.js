var azure = require('azure-storage');
var events = require('./event_module.js');

var queueService = null;

module.exports = {
	
	initialize : function(){
		queueService = azure.createQueueService('walksmart1','ZwEU627jtc7HbKxmzWvovaepw99Y47jP4WrVcCqR/i0xwQNo2Q0uSHnWUkBQhWH6rXFNt5JUnJB1S5F2Mbso1w==');
		queueService.createQueueIfNotExists('pi-walk-items',function(error){
			if (!error){
				console.log("Queue Exists");
				events.setQueueReady();
			} else {
				console.log("Create Queue Error: ");
				console.log(error);
			}
		});
		
		
	},
	
	add : function(obj){
		
		//obj = {"address": "C449C2FA3DB2", "rotations" : 11, "duration": 17, "year":17,"month":3,"day":19,"hour":7,"minute":13}
		
		message = JSON.stringify(obj);
		b64message = new Buffer(message).toString('base64');

		console.log(message);

		queueService.createMessage('pi-walk-items',b64message,function(error){
			if (!error){
				console.log("success");
			} else {
				console.log('Create Message Error: ');
				console.log(error);
			}
		});
		
	}
	
}









