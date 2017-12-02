var events = require('events');

var emitter = new events.EventEmitter();

var connected = false;

module.exports = 
{
	emitter : emitter,
	
	noMoreStoredWalks : false,
	
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
	},
	
	setConnected: function(){
		console.log("set walksmart connected");
		connected = true;
		this.emitter.emit("connected");
	},
	
	setDisconnected: function(){
		connected = false;
	},
	
	isConnected: function(){
		return connected;
	},
	
	setNoMoreStoredWalks : function(b){
		this.noMoreStoredWalks = b;
	},
	
	startScanAnyway: function(){
		this.emitter.emit("startScanAnyway");
	}
	

}
