let space = require('../core/space-transf.js');

let angle = (deg) => {

	while(deg < 0){
		deg += 360;
	}
	let span = 5;
	let v = Math.abs(deg - 90) < span || Math.abs(deg - 270) < span;

	return {
		rad: deg * Math.PI / 180,
		isVert: v,
		dir: v ? deg < 180 ? -1 : 1 : deg < 90 || deg > 270 ? 1 : -1
	};
};

// in fct so we don't compute if
// no tag
// tag = {
//	 pin: true || false // show the line
//	 pinHook:  // horizontal line
//	 pinLength: // length to mark
//	 print: // how to print
//	 theta: // angle from mark
// }
let pin = function(pos,tag,ds) {
	// angle
	let ang = angle(tag.pinAngle);
	// anchor
	let anchor = {
		top:		ang.isVert && ang.dir > 0,
		bottom: ang.isVert && ang.dir < 0,
		left:  !ang.isVert && ang.dir > 0,
		right: !ang.isVert && ang.dir < 0
	};

		// mark
	let mpos = {
		x: space.toC(ds.x,pos.x),
		y: space.toC(ds.y,pos.y)
	};

		// pin length
	let pl = {
		x: Math.cos(ang.rad) * tag.pinLength,
		y: Math.sin(ang.rad) * tag.pinLength,
	};

		// pin hook
	let ph = {
		x: ang.isVert ? 0 : ang.dir * tag.pinHook,
		y: ang.isVert ? ang.dir * tag.pinHook : 0
	};

	// position = mark + length + hook
	let lpos = {
		x: mpos.x + pl.x + ph.x,
		y: mpos.y - pl.y + ph.y 
	};

	let lAnc = {
		x: lpos.x + (anchor.left ? 3 : -3),
		y: lpos.y + (anchor.top ? tag.fontSize : anchor.bottom ? -3 : 1)
	};

	let path = 'M ' + mpos.x + ',' + mpos.y + ' L ' + (mpos.x + pl.x) + ',' + (mpos.y - pl.y) + ' L ' + lpos.x + ',' + lpos.y;
	return {
		label: tag.print(pos.tag),
		labelAnc: anchor.top || anchor.bottom ? 'middle' : anchor.left ? 'start' : 'end',
		labelFS: tag.fontSize,
		x: lpos.x,
		y: lpos.y,
		xL: lAnc.x,
		yL: lAnc.y,
		path: !tag.pin ? null : path,
		pinColor: tag.pinColor,
		color: tag.color
	};
};


let m = (pos,tag,ds) => tag.show ? pin(pos,tag,ds) : null;

module.exports = m;
