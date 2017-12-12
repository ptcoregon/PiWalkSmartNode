
var gpio = require("rpi-gpio");

var interval;

var timeout;

var buzz_count;

var buzz_max_count;

function buzz_on() {
	
	gpio.write(33,true,function(err){
		if(err) console.log(err);
	});
	
	timeout = setTimeout(buzz_off,500);
	buzz_count = buzz_count + 1;

}

function buzz_off() {
	
	gpio.write(33,false,function(err){
		if(err) console.log(err);
	});
	
	if (buzz_count >= buzz_max_count){
		if (interval) clearInterval(interval);
		buzz_count = 0;
		buzz_max_count = 0;
	}

}

module.exports = {
	
	buzz: function(number){
		console.log("buzz");
		if (interval) clearInterval(interval);
		if (timeout) clearTimeout(timeout);
		interval = setInterval(buzz_on,1000);
		buzz_count = 0;
		buzz_max_count = number;
	},
	
	init: function(){
		var self = this;
		console.log("init buzz");
		gpio.setup(33,gpio.DIR_OUT,gpio.EDGE_NONE,function(error){
			if(error) console.log(error);
			self.buzz(3);
		});
		
	}
	
	
}


