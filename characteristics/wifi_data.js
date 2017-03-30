
var currentSSID = 'currentSSID!';

var newSSID = "newSSID!";

var password = "password!";

var status = 0;

var events = require('events');

var emitter = new events.EventEmitter();



module.exports = {
	
	currentSSID : currentSSID,
	
	newSSID : newSSID,
	
	password : password,
	
	status : 0x05,
	
	emitter : emitter,
	
	setPassword : function(pass){
		console.log("set password");
		this.password = pass;
		this.emitter.emit('newCreds');
	}
	
}
