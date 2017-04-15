var azure = require('azure-storage');
var events = require('./event_module.js');
var led = require('./led.js');
var semver = require('semver');

var execSync = require('child_process').execSync;

var queueService = null;

var createAttempts = 0;

var currentVersion = null;

var queueVersion = null;

module.exports = {
	
	initialize : function(){
		var self = this;
		queueService = azure.createQueueService('walksmart1','ZwEU627jtc7HbKxmzWvovaepw99Y47jP4WrVcCqR/i0xwQNo2Q0uSHnWUkBQhWH6rXFNt5JUnJB1S5F2Mbso1w==');
		queueService.createQueueIfNotExists('pi-updates',function(error){
			if (!error){
				console.log("Update Queue Exists");
				self.getPackageVersion();
				createAttempts = 0;
				
			} else {
				console.log("Create Update Queue Error: ");
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

	getPackageVersion : function() {
		currentVersion = require('./package.json').version;
		console.log("Current Version: " + currentVersion);
		this.getQueueVersion();
	},
	
	getQueueVersion: function() {
		var self = this;
		queueService.peekMessage('pi-updates',function(error,result,response){
			if (results !== undefined){
				queueVersion = result.messageText;
				console.log("Queue Version: " + queueVersion);
				self.compareVersions();
			} else if(error) {
				console.log('Peek Queue Message Error: ');
				console.log(error);
				events.setQueueError();
			} else {
				console.log("No version update");
			}	
		});
	},
	
	compareVersions : function(){
		if (semver.gt(queueVersion,currentVersion))
		{
			console.log("Update Verion from " + currentVersion + " to " + queueVersion);
			led.blink(3000);
			execSync('sudo npm install git+https://git@github.com/ptcoregon/PiWalkSmartNode.git');
			execSync('sudo reboot');
			
			
			
		} else {
			console.log("We have the most recent version");
		}
		

	},
	

	
}









