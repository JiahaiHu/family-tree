require ('../ajax.js');
require ('../animations');
var $ = require ('jquery');
var clone = function(obj, not_completely){
	var o;
	if (obj.constructor == Object || obj.constructor == Array){
		o = new obj.constructor();
	}else{
		o = new obj.constructor(obj.valueOf());
	}
	console.log(o);
	for(var key in obj){
		if(not_completely && obj[key] === null) {
			continue;
		}

		if ( o[key] != obj[key] ){
			if ( typeof(obj[key]) == 'object' ){
				o[key] = clone(obj[key]);
			}else{
				o[key] = obj[key];
			}
		}
	}
	o.toString = obj.toString;
	o.valueOf = obj.valueOf;
	return o;
};

var angular_module = angular.module('components', ['ngAnimate', 'ajax', 'myAnimation']);

module.exports = {
	ng_module: angular_module,
	jquery: $,
	clone: clone
};
