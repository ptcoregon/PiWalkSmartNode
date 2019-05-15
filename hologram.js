deviceID = 999;

var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var fs = require('fs');
var file = require('./file_store.js');

var events = require('./event_module.js');

const MAX_CONNECT_RETRIES = 1;

const ERR_CONNECT = 'Could not connect to hologram.';
const ERR_START = 'Could not start hologram.';
const ERR_STOP = 'Could not stop hologram.';
	
var commands = {
	reset: 'sudo hologram modem reset',
}

var busy = false;


var hologram = {

	reset: function(){
		var m = execSync(commands.reset);
		//console.log("done resetting modem");
		return true;
	},
	
	send: function(message,callback){
		busy = true;
		try {
			var str = deviceID + ":" + message;
			console.log("sending via hologram...");
			var m = exec('sudo hologram send "' + str + '"',function(error,stdout,stderr){
				busy = false;
				
				if (error || stderr){
					console.log("Sending error: " + stderr);
					busy = true;
					var m = exec('sudo hologram send "' + str + '"',function(error,stdout,stderr){
						busy = false;
						
						if (error || stderr){
							console.log("Sending error 2: " + stderr);
							events.setCellularError();
						} else {
							console.log(stdout);
							console.log(stderr);
							
							//var str = stdout.toString('utf8');
							if (stdout.indexOf("RESPONSE MESSAGE: Message sent successfully") > -1){
								console.log("Success");
							} 
							
							callback(message);
						}
					});
					
					
				} else {
					console.log(stdout);
					console.log(stderr);
					
					//var str = stdout.toString('utf8');
					if (stdout.indexOf("RESPONSE MESSAGE: Message sent successfully") > -1){
						console.log("Success");
					} 
					
					callback(message);
				}
			});
		} catch(e){
			console.log(e);
			busy = false;
		}
	},
	
	
	isConnected: function(){
		try {
			var m = execSync("sudo hologram modem operator");
			var str = m.toString('utf8');
			var i = str.indexOf('None');
			//console.log("operator: " + str.length);

			if (i < 0 && str.length > 2){
				return true;
			} else {
				return false;
			}
		} catch(e){
			return false;
		}
	},
	
	startChecks: function(){
		var self = this;
		//check network connection every 30 seconds
		//setInterval(function(){
			//if (!self.isConnected()) //not connected
			//{
				//console.log("Cellular Disconnected!");
				//events.setQueueError();
			//}
		//},30000);
	},
	
}

module.exports = hologram;
