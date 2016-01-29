var utils = require('../core/utils.cs.js');

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
	line.start[othdir] = partnerDs.c.min;
	line.end = {};
	line.end[dir] = ds.c.max;
	line.end[othdir] = partnerDs.c.max;
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
			label: '',
			FSize: ,
			offset: {x, y},
			anchor: '',
			color: '',
			dir
		},
*/

	var label = {
		label: props.label,
		FSize: props.labeLFSize,
		offset: props.labelOffset,
		anchor: props.labelAnchor,
		color: props.labelColor,
		dir: utils.direction(line)
	};
	label.position = {
		x: (line.end.x + line.start.x)/2 + label.dir.x * 40 + props.offset.x,
		y: (line.end.y + line.start.y)/2 + label.dir.y * 40 + props.offset.y
	};

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
