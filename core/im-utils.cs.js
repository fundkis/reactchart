var utils = require('./utils.cs.js');
var im = require('freezer-js');

var deepEqual = function(obj1,obj2){
	if(typeof obj1 === 'object'){
		if(!obj2 || typeof obj2 !== 'object'){
			return false;
		}
		if(obj1 instanceof Date){
			return obj2 instanceof Date ? obj1.getTime() === obj2.getTime() : false;
		}else{
			for(var t in obj1){
				if(!deepEqual(obj1[t],obj2[t])){
					return false;
				}
			}
			for(var u in obj2){
				if(obj1[u] === null ||  obj1[u] === undefined){
					return false;
				}
			}
		}
	}else{
		return obj1 === obj2;
	}
	return true;
};

var m = {};

m.mergeDeep = function(src,tgt){

	return utils.deepCp(tgt,src);

};

m.immutable = function(obj){

	return im.Map.isMap(obj) ? obj : im.fromJS(obj);

};

m.freeze = function(obj){
	return new im(obj).get();
};

m.isEqual = function(obj1,obj2){
	var immut = im.Map.isMap(obj1);

	return immut === im.Map.isMap(obj2) ? immut ? obj1 === obj2 : deepEqual(obj1,obj2) : false;

};

module.exports = m;
