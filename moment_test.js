//var moment = require('moment');
var moment = require('moment-timezone');

var tz = moment.tz.guess();
console.log(tz);

var x = new Date();
var off = x.getTimezoneOffset();
console.log(off);

/*
var d = moment();
	var off = d.utcOffset();
	console.log(off);
	var unixtime = d.format('X');
	var unixtime = parseInt(unixtime);
	var new_unixtime = unixtime + (off*60);
	
	console.log(unixtime);
	console.log(new_unixtime);
*/
