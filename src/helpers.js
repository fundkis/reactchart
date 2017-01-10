var core = require('./core/process.js');
var utils = require('./core/utils.js');
var space = require('./core/space-transf.js');

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
