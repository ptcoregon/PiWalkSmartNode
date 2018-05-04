var http = require("http");
var moment = require("moment");
var execSync = require('child_process').execSync;
var events = require('./event_module.js');

var self = module.exports = {
	
	update: function(){
		http.get({
			hostname: 'worldclockapi.com',
			path: '/api/json/utc/now'
			
		},function(res){
			var date_string = res.headers.date;
			var m = moment(date_string);
			var now = moment();
			var diff = m.diff(now);
			
			if (diff > 30000){
				var m_string = m.format("DD MMM YYYY HH:mm:ss");
				console.log("Update System Clock: " + m_string);
				var command_string = "sudo date -s '" + m_string + "'";
				//console.log(command_string);
				var response = execSync(command_string);
				//console.log(response);
				events.setClockUpdated();
				
			} else {
				
				console.log("System clock is correct");
				events.setClockUpdated();
			}
			
			
		});
	}
	
}
