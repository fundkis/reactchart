var core = require('./core/process.cs.js');
var utils = require('./core/utils.cs.js');
var space = require('./core/space-transf.cs.js');

var m = {};

m.init = function(rawProps,type){

	var props = utils.deepCp({},rawProps);
	props.freeze = type;

	var freezer = core.process(props);

	var rc = {};

	rc.props = () => {return freezer.get();};

	rc.mgr = () => {return freezer;};

	rc.toC = (point) => {
		return {
			x: space.toC(point.ds.x,point.position.x),
			y: space.toC(point.ds.y,point.position.y)
		};
	};


	return rc;

};

module.exports = m;
