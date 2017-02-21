let utils = require('./utils.js');
let im = require('freezer-js');

let deepEqual = function(obj1,obj2){
	if(typeof obj1 === 'object'){
		if(!obj2 || typeof obj2 !== 'object'){
			return false;
		}
		if(obj1 instanceof Date){
			return obj2 instanceof Date ? obj1.getTime() === obj2.getTime() : false;
		}else{
			for(let t in obj1){
				if(!deepEqual(obj1[t],obj2[t])){
					return false;
				}
			}
			for(let u in obj2){
				if(obj1[u] === null ||	obj1[u] === undefined){
					return false;
				}
			}
		}
	}else{
		return obj1 === obj2;
	}
	return true;
};

let noFreeze = function(obj){
	return {
		object: obj,
		get: () => {obj = utils.deepCp({},obj); return obj;}
	};
};

let m = {};

m.mergeDeep = function(src,tgt){
	return utils.deepCp(tgt,src);
};

m.isImm = function(obj){
	return (typeof(obj)  !== 'object') ||  Object.isFrozen(obj);
};

m.immutable = function(obj){
	return m.isImm(obj) ? obj : im.fromJS(obj);
};

m.freeze = function(obj,type){
	return type === 'no' ? noFreeze(obj) : new im(obj);
};

m.isEqual = function(obj1,obj2){

	let immut1 = m.isImm(obj1);
	let immut2 = m.isImm(obj2);
	return immut1 === immut2 ? immut1 ? obj1 === obj2 : deepEqual(obj1,obj2) : false;
};

module.exports = m;
