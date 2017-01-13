var utils = require('../core/utils.js');

/*
	{
		show: true || false,
	///// line part
		line: {
			CS: ''
			start: {x,y},
			end: {x, y},
			origin: {x,y},
			radius: {x, y},
			color: '',
			width:,
		},

	/// label part
		label: Label = {
			label: '',
			FSize: ,
			offset: {x, y},
			anchor: ''
			color: '',
			dir: {x, y}
		},

 /// common factor part
		comFac: {
			factor: ,
			offset: {x, y},
			FSize: ,
			anchor
		}
	}
*/

var m ={};

m.VM = function(ds,props,partnerDs,dir){

	var show = props.show;

/*
		line: {
			CS: ''
			start: {x,y},
			end: {x, y},
			origin: {x,y},
			radius: {x, y},
			color: '',
			width:,
		},
*/

	var line = {};

	var tmp = {
		color: true,
		width: true
	};

	var othdir = dir === 'x' ? 'y' : 'x';
	line.CS = props.CS;
		// cart
	line.start = {};
	line.start[dir] = ds.c.min;
	line.start[othdir] = props.placement === 'right' || props.placement === 'top' ?  partnerDs.c.max : partnerDs.c.min;
	line.end = {};
	line.end[dir] = ds.c.max;
	line.end[othdir] = line.start[othdir];
		// polar
	line.origin = {};
	line.origin[dir] = (ds.c.min + ds.c.max) / 2;
	line.origin[othdir] = (partnerDs.c.min + partnerDs.c.max) / 2;
	line.radius = {};
	line.radius[dir] = Math.abs(ds.c.max - ds.c.min) / 2;
	line.radius[othdir] = Math.abs(partnerDs.c.max - partnerDs.c.min) / 2;

	for(var u in tmp){
		line[u] = props[u];
	}

/*
		label: {
			ds: {x:, y: },
			position: {x: , y:},
			label: '',
			FSize: ,
			offset: {x, y},
			anchor: '',
			color: '',
			dir
		},
*/

	var lineDir = utils.direction(line);
	var label = {
		label: props.label,
		FSize: props.labelFSize,
		anchor: props.labelAnchor,
		color: props.labelColor,
		dir: {
			x: Math.sqrt(lineDir.x / lineDir.line),
			y: Math.sqrt(lineDir.y / lineDir.line)
		},
		rotate: true,
		transform: false
	};

	label.position = {
		x: (line.end.x + line.start.x)/2,
		y: (line.end.y + line.start.y)/2
	};

	// & anchoring the text
	var fd = 0.25 * label.FSize; // font depth, 25 %
	var fh = 0.75 * label.FSize; // font height, 75 %
	var defOff = props.empty ? 20 : 40;

	var offsetLab = (() => {
		switch(props.placement){
			case 'top':
				return {
					x: 0,
					y: - fd - defOff
				};
			case 'bottom':
				return {
					x: 0,
					y: fh + defOff
				};
			case 'left':
				return {
					x: - fd - defOff,
					y: 0
				};
			case 'right':
				return {
					x: fd + defOff,
					y: 0
				};
			default:
				throw new Error('Where is this axis: ' + props.placement);
		}
	})();

	label.offset = {
		x: offsetLab.x + props.labelOffset.x,
		y: offsetLab.y + props.labelOffset.y
	};

	label.ds = {};
	label.ds[dir] = ds;
	label.ds[othdir] = partnerDs;

/*
		comFac: {
			factor: ,
			offset: {x, y},
			FSize: ,
			anchor: ''
		}
*/

	var comFac = {
		factor: props.factor,
		offset: props.factorOffset,
		anchor: props.factorAnchor,
		Fsize:  props.factorFSize,
	};


	return {
		show: show,
		line: line,
		label: label,
		comFac: comFac
	};

};

module.exports = m;
