/*
var forever = require('forever-monitor');

var child = new (forever.Monitor)('walksmartnode1.js',{
	args:[],
	killTree:true
});


child.on('exit',function(){
	console.log("Program has exited permanently");
});


child.on('restart',function(){
	console.log("Program restarted");
});


child.on('exit:code',function(code){
	console.log("Forever detected script exited with code: " + code);
});

child.start();


*/

var count = 0;


setInterval(function(){
	console.log(count);
	count++;
	
	if (count > 20)
	{
		process.exit();
	}
},1000);
