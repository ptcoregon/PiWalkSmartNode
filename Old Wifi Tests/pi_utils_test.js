var utils = require('pi-utils');

var rev = utils.wifi.connect("TurtleIsland","grandforks");

console.log(rev);

rev.then(function(e){
	console.log(e);
});

console.log(rev);
