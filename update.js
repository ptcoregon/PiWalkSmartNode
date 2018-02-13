var events = require('./event_module.js');
var led = require('./led.js');
var semver = require('semver');

var execSync = require('child_process').execSync;

//var currentVersion = null;

//var queueVersion = null;

module.exports = {

	getPackageVersion : function() {
		currentVersion = require('./package.json').version;
		console.log("Current Version: " + currentVersion);
		return currentVersion;
	},
	
	compareVersions : function(newVersion){
		var currentVersion = this.getPackageVersion();
		newVersion = newVersion.toString();
		
		newVersion = semver.valid(newVersion);

		if (semver.gt(newVersion,currentVersion))
		{
			console.log("Update Verion from " + currentVersion + " to " + newVersion);
			led.blink(3000);
			execSync('cd /home/pi');
			execSync('sudo npm install git+https://git@github.com/ptcoregon/PiWalkSmartNode.git');
			execSync('sudo reboot');
		} else {
			console.log("We have the most recent version");
		}

	},
	
	update : function(){
		led.blink(3000);
		execSync('cd /home/pi');
		execSync('sudo npm install git+https://git@github.com/ptcoregon/PiWalkSmartNode.git');
		execSync('sudo reboot');	
	}
	
}









