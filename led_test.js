
var gpio = require("rpi-gpio");

//gpio.setMode(gpio.MODE_BCM);

var interval = 500;

var int = setInterval(off,1000);

gpio.setup(8,gpio.DIR_OUT,function(){
	led(500);
});


function on() {
	
	gpio.write(8,true,function(err){
		if(err) throw err;
	});
	
	setTimeout(off,interval);

}

function off() {
	
	gpio.write(8,false,function(err){
		if(err) throw err;
	});

}

function led(time){
	clearInterval(int);
	interval = time;
	int = setInterval(on,interval*2);

}

setTimeout(function(){led(1000);},7000);

setTimeout(function(){led(200);},15000);



