var file = require("./file_store.js");
var hologram = require("./hologram.js");

var self = module.exports = {
	
	sendMessage: function(m){
		var self = this;
		if (!hologram.busy){
			if (m.length > 0){
				hologram.send(m,function(data){
					console.log("send callback");
					require("./file_store.js").removeFromStore(data);
				});
			} else {
				console.log("nothing to send");
			}
		} else {
			console.log("hologram is busy");
		}
	},
	
	sendTipAlert: function(address){
		hologram.send(address + ":t",function(data){
			console.log("sent tip alert");
			require("./file_store.js").getStoredData();
		});
	},
	
	sendWalkAlert: function(address){
		hologram.send(a + ":w",function(data){
			console.log("sent walk alert");
			require("./file_store.js").getStoredData();
		});
	},
	
}
