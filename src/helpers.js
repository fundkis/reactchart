let core = require('./core/process.js');
let utils = require('./core/utils.js');
let space = require('./core/space-transf.js');

let m = {};

m.init = function(rawProps,type){

	let props = utils.deepCp({},rawProps);
	props.freeze = type;

	let freezer = core.process(props);

	let rc = {};

	rc.props = () => freezer.get();

	rc.mgr = () => freezer;

	rc.toC = (point) => {
		return {
			x: space.toC(point.ds.x,point.position.x),
			y: space.toC(point.ds.y,point.position.y)
		};
	};

  rc.__preprocessed = true;


  rc.updateGraph = (obj) => freezer.on('update',() => obj.forceUpdate());

	return rc;

};

module.exports = m;
