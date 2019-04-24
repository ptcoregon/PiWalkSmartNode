var fs = require('fs');
var folder = '/home/pi/walk_objects/';
var network = require('./network.js');

var self = module.exports = {
	
	add : function(str){
		
		console.log("add to file");

		var filename = str + '.txt';

		fs.writeFile(folder + filename,str,function(error){
			if (error) {console.log("write to file error: " + error);
			} else {
				console.log("wrote to file"); 
			}
		});

	},
	
	getStoredData: function(){
		console.log("Adding stored data to files:");
		var self = this;
		
		fs.readdir(folder,function(error,files){
			if (error) {console.log(error);}
			else {
				var length = files.length;
				var str = "";
				for(var x = 0; x < files.length; x++){
					console.log(files[x]);
					var contents = fs.readFileSync(folder + files[x],'utf-8');
					if (contents) {
						str = str + contents + "-";
					} else {
						fs.unlink(folder + files[x], function(err){
							console.log(err);
						});
					}
				}
				console.log("from files: " + str);

				if (str.length > 0){
					network.sendMessage(str);
				}
			}
		});
		
	},
	
	removeFromStore: function(message){
		console.log("remove from store");
		
		var arr = message.split("-");
		
		for (var x = 0; x < arr.length; x++){
			var id = arr[x].trim();
			
			if (id.length > 0){
				var file = id + '.txt';
			
				console.log("remove file: " + file);
				
				fs.unlink(folder + file, function(err){
					if(err) console.log(err);
				});
			} else {
				console.log("blank id");
			}
			
		}

	},
	

	
}
