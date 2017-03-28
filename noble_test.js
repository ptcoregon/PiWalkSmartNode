var noble = require('noble');

noble.on('stateChange',function(state){
	console.log(state);
	if (state == "poweredOn")
	{
		noble.startScanning([],false,function(error){
			console.log(error);
		});
	}
});



noble.on('discover',function(peripheral){
	console.log(peripheral.advertisement.localName);
		
});
