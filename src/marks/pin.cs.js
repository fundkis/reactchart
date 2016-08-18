var space = require('../core/space-transf.cs.js');

var angle = (deg) => {

	var span = 5;
	var v = Math.abs(deg - 90) < span || Math.abs(deg - 270) < span;

	return {
		rad: deg * Math.PI / 180,
		isVert: v,
		dir: v ? deg < 180 ? 1 : -1 : deg < 90 || deg > 270 ? 1 : -1
	};
};

// in fct so we don't compute if
// no tag
// tag = {
//   pin: true || false // show the line
//   pinHook:  // horizontal line
//   pinLength: // length to mark
//   print: // how to print
//   theta: // angle from mark
// }
var pin = function(pos,tag,ds) {
	// angle
	var ang = angle(tag.pinAngle);
	// anchor
	var anchor = {
		top:    ang.isVert && ang.dir < 0,
		bottom: ang.isVert && ang.dir > 0,
		left:  !ang.isVert && ang.dir > 0,
		right: !ang.isVert && ang.dir < 0
	};

		// mark
	var mpos = {
		x: space.toC(ds.x,pos.x),
		y: space.toC(ds.y,pos.y)
	};

		// pin length
	var pl = {
		x: Math.cos(ang.rad) * tag.pinLength,
		y: Math.sin(ang.rad) * tag.pinLength,
	};

		// pin hook
	var ph = {
		x: ang.isVert ? 0 : tag.pinHook * ang.dir,
		y: ang.isVert ? tag.pinHook * ang.dir : 0
	};

	// position = mark + length + hook
	var lpos = {
		x: mpos.x + pl.x + ph.x,
		y: mpos.y - pl.y - ph.y - (anchor.top ? tag.fontSize + 3 : 0)
	};

	var path = 'M ' + mpos.x + ',' + mpos.y + ' L ' + (mpos.x + pl.x) + ',' + (mpos.y - pl.y) + ' L ' + lpos.x + ',' + lpos.y;
	return {
		label: tag.print(pos.tag),
		labelAnc: anchor.top || anchor.bottom ? 'middle' : anchor.left ? 'start' : 'end',
		labelFS: tag.fontSize,
		x: lpos.x,
		y: lpos.y,
		path: !tag.pin ? null : path
	};
};


var m = function(pos,tag,ds){
	return tag.show ? pin(pos,tag,ds) : null;
};

module.exports = m;
