let React = require('react');

let imUtils = require('../core/im-utils.js');

class Pie extends React.Component {

	shouldComponentUpdate(props){
		return !imUtils.isEqual(props.state,this.props.state);
	}

	render(){

		let { path } = this.props.state;
		let { labels, positions, 
			pinRadius, pinLength, pinHook, pinDraw, pinFontSize, 
			origin, radius, toreRadius } = path;

		if(positions.length === 0){
			return null;
		}

		let abs = (ang,rad,or) =>   rad * Math.cos(ang * Math.PI / 180) + or.x;
		let coo = (ang,rad,or) => - rad * Math.sin(ang * Math.PI / 180) + or.y;

		let oldT = 0;
		let out = [];
		let x = abs(oldT,radius,origin);
		let y = coo(oldT,radius,origin);

		for(let p = 0; p < positions.length; p++){

			let color = positions[p].color;
			let theta = Math.min(positions[p].value, 359.9640);// more than 99.99% is a circle (not supported by arc anyway)
			let label = !!labels[p] ? labels[p] : null;
			let x1 = abs(oldT,toreRadius,origin);
			let y1 = coo(oldT,toreRadius,origin);
			let x2 = abs(oldT,radius,origin);
			let y2 = coo(oldT,radius,origin);
			let x3 = abs(theta + oldT,radius,origin);
			let y3 = coo(theta + oldT,radius,origin);
			let x4 = abs(theta + oldT,toreRadius,origin);
			let y4 = coo(theta + oldT,toreRadius,origin);

			// large-arc-flag, true if theta > 180
			let laf = theta > 180 ? 1 : 0;
			let path = 'M' + x1 + ',' + y1 + 
				' L' + x2 + ',' + y2 + ' A' + radius     + ',' + radius     + ' 0 ' + laf + ',0 ' + x3 + ',' + y3 +
				' L '+ x4 + ',' + y4 + ' A' + toreRadius + ',' + toreRadius + ' 0 ' + laf + ',1 ' + x1 + ',' + y1;

			out.push(<path key={p} fill={color} stroke='none' strokeWidth='0' d={path}/>);

			if(!!label){
				let curAng = theta / 2 + oldT;
				let offset = curAng === 90 || curAng === 270 ? 0 :
					curAng > 90 && curAng < 270 ? - pinHook : pinHook;
				let xc1 = abs(curAng, pinRadius, origin);
				let yc1 = coo(curAng, pinRadius, origin);
				let xc2 = abs(curAng, pinRadius + pinLength, origin);
				let yc2 = coo(curAng, pinRadius + pinLength, origin);
				let xc3 = xc2 + offset;
				let yc3 = yc2;
				let xc = xc3 + offset / 2;
				let yc = yc2 + ( curAng === 90 ? - 5 : curAng === 270 ? 5 : 0) ;
				let lstyle = {
					textAnchor: curAng === 90 || curAng === 270 ? 'center' :
							curAng > 90 && curAng < 270 ? 'end' : 'start'
				};
				if(pinDraw){
					let lpath = 'M' + xc1 + ',' + yc1 +  ' L' + xc2 + ',' + yc2 +  ' L' + xc3 + ',' + yc3;
					out.push(<path key={p + '.ll'} strokeWidth='1' stroke='black' fill='none' d={lpath}/>);
				}
				out.push(<text fontSize={pinFontSize} key={p + '.l'} x={xc} y={yc} style={lstyle}>{label}</text>);
			}
			x = x2;
			y = y2;
			oldT += theta;
		}

		return <g>{out}</g>;
	}
}

module.exports = Pie;
