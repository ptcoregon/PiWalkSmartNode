var h = "hello";
var exec = require('child_process').exec;

var exports = module.exports = {};

exports.hello = function(){
	console.log(h);
	return h;
};
