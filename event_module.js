var events = require('events');

var emitter = new events.EventEmitter();

module.exports = 
{
	emitter : emitter,
	
	setPassword : function(pass){
		console.log("set password");
		this.emitter.emit('newCreds');
	},
	
	setWifiConnected: function(){
		console.log("set connected");
		this,emitter.emit("wifiConnected");
	},
	
	setQueueReady: function(){
		console.log("queue ready");
		this,emitter.emit("queueReady");
	},
	
	setQueueError: function(){
		console.log("queue error");
		this.emitter.emit("queueError");
	}
	

}
