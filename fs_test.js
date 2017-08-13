var fs = require('fs');
var folder = '/walk_objects/';

var obj = {id:'123456',distance:56,duration:60};


var filename = obj.id + '.json';

fs.writeFile(folder + filename,JSON.stringify(obj),function(error){
	console.log(error);
});




fs.readdir(folder,function(error,files){
	if (error) {console.log(error)};
	
	files.forEach(function(file){
		console.log(file);
		fs.readFile(folder + file,'utf-8',function(error,data){
			if (error) console.log(error);
			console.log(data);
			fs.unlink(folder + file, function(err){
				console.log(err);
			});
		});
	});

});
