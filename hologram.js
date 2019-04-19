var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var fs = require('fs');

const MAX_CONNECT_RETRIES = 1;

const ERR_CONNECT = 'Could not connect to hologram.';
const ERR_START = 'Could not start hologram.';
const ERR_STOP = 'Could not stop hologram.';
	
var commands = {
	disconnect: 'sudo hologram network disconnect',
	connect: 'sudo hologram network connect',
	reset: 'sudo hologram modem reset',
	getLocalIP: "sudo /sbin/ifconfig ppp0",
}


var hologram = {
	
	disconnect: function(){
		var m = execSync(commands.disconnect);
		return true;
	},
	
	reconnect: function(){
		var m = execSync(commands.connect);
		console.log("reconnecting");
		var x = this.isConnected();
		console.log("connected? : " + x);
		return x;
	},
	
	reset: function(){
		var m = execSync(commands.reset);
		return true;
	},
	
	
	isConnected: function(){
		try {
			var m = execSync(commands.getLocalIP);
			var str = m.toString('utf8');
			var i = str.indexOf('inet ');
			//console.log(i);
			var ip = str.substr(i+5);
			//console.log(ip);
			var ip = ip.split(' ')[0];
			console.log(ip);

			if (ip.length > 5){
				return true;
			} else {
				return false;
			}
		} catch(e){
			return false;
		}
	},
	
}

module.exports = hologram;
