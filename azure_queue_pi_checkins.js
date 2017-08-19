var azure = require('azure-storage');
var events = require('./event_module.js');
var execSync = require('child_process').execSync;
var moment = require('moment-timezone');

var queueService = null;

var createAttempts = 0;

module.exports = {
	
	initialize : function(){
		var self = this;
		queueService = azure.createQueueService('walksmart1','ZwEU627jtc7HbKxmzWvovaepw99Y47jP4WrVcCqR/i0xwQNo2Q0uSHnWUkBQhWH6rXFNt5JUnJB1S5F2Mbso1w==');
		queueService.createQueueIfNotExists('pi-checkins',function(error){
			if (!error){
				console.log("Checkin Queue Exists");
				createAttempts = 0;
				self.sendCheckin();
			} else {
				console.log("Create Checkin Queue Error: ");
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
	

	sendCheckin: function(){
		var self = this;
		
		var serialBuffer = execSync("cat /proc/cpuinfo | grep Serial | cut -d ' ' -f 2");
		var serial = serialBuffer.toString();
		var now = moment().toISOString();
		
		obj = {"serial":serial,"timestamp":now};

		message = JSON.stringify(obj);
		b64message = new Buffer(message).toString('base64');

		//console.log(message);
		var options = {'clientRequestTimeoutInMs':1800000,'maximumExecutionTimeInMs':180000};

		queueService.createMessage('pi-checkins',b64message,options,function(error){
			if (!error){
				console.log("Successfully Added Pi Checkin to Queue");
				addAttempts = 0;
				return true;
			} else {
				console.log('Create Queue Message Error: ');
				console.log(error);				
				
				
			}
		});

	}

	
}

