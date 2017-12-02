
var gpio = require("rpi-gpio");

var interval;

var int;

var to;

function on() {
	
	gpio.write(8,true,function(err){
		if(err) console.log(err);
	});
	
	to = setTimeout(off,interval);

}

function off() {
	
	gpio.write(8,false,function(err){
		if(err) console.log(err);
	});

}

module.exports = {
	
	blink: function(time){
		console.log("blink");
		if (int) clearInterval(int);
		if (to) clearTimeout(to);
		
		if (time == 0)
		{
			off();
		} else {
			on();
			interval = time;
			int = setInterval(on,interval*2);
		}
	},
	setOn: function(){
		
		if (int) clearInterval(int);
		if (to) clearTimeout(to);
		
		interval = 0;
		gpio.write(8,true,function(err){
			if(err) throw err;
		});
	},
	init: function(){
		console.log("init led");
		gpio.setup(8,gpio.DIR_OUT,gpio.EDGE_NONE,function(error){
			if(error) console.log(error);
			interval = 200;
			on();
			int = setInterval(on,interval*2);
		});
		
	}
	
	
}


