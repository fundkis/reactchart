var React = require('react');

var imUtils = require('../core/im-utils.cs.js');

var Pie = React.createClass({

	shouldComponentUpdate: function(props){
		return !imUtils.isEqual(props.state,this.props.state);
	},

	render: function(){

		var labels = this.props.state.path.labels;
		var positions = this.props.state.path.positions;
		var pinRad = this.props.state.path.pinRadius;
		var pinLen = this.props.state.path.pinLength;
		var pinOff = this.props.state.path.pinHook;
		var pinDraw = this.props.state.path.pinDraw;
		var pfs = this.props.state.path.pinFontSize;
		//var ds = state.ds;

		var abs = function(ang,rad,or){
			return rad * Math.cos(ang * Math.PI / 180) + or.x;
		};
		var coo = function(ang,rad,or){
			return - rad * Math.sin(ang * Math.PI / 180) + or.y;
		};

		var ori = this.props.state.path.origin;
		var oldT = 0;
		var out = [];
		var r = this.props.state.path.radius;
		var rin = this.props.state.path.toreRadius;
		var x = abs(oldT,r,ori);
		var y = coo(oldT,r,ori);
		for(var p = 0; p < positions.length; p++){

			var color = positions[p].color;
			var theta = positions[p].value;
			var label = !!labels[p] ? labels[p] : null;
			var x1 = abs(oldT,rin,ori);
			var y1 = coo(oldT,rin,ori);
			var x2 = abs(oldT,r,ori);
			var y2 = coo(oldT,r,ori);
			var x3 = abs(theta + oldT,r,ori);
			var y3 = coo(theta + oldT,r,ori);
			var x4 = abs(theta + oldT,rin,ori);
			var y4 = coo(theta + oldT,rin,ori);

			if(Math.floor(theta) === 360){
				out.push(<circle key={p} cx={ori.x} cy={ori.y} r={r} fill={color} strokeWidth='0'/>);
			}else{
				var path = 'M' + x1 + ',' + y1 + 
					' L' + x2 + ',' + y2 + ' A' + r   + ',' + r   + ' 0 0,0 ' + x3 + ',' + y3 + 
					' L '+ x4 + ',' + y4 + ' A' + rin + ',' + rin + ' 0 0,1 ' + x1 + ',' + y1;
				out.push(<path key={p} fill={color} stroke='none' strokeWidth='0' d={path}/>);
			}
			if(!!label){
				var curAng = theta / 2 + oldT;
				var offset = curAng === 90 || curAng === 270 ? 0 : 
					curAng > 90 && curAng < 270 ? - pinOff : pinOff;
				var xc1 = abs(curAng, pinRad, ori);
				var yc1 = coo(curAng, pinRad, ori);
				var xc2 = abs(curAng, pinRad + pinLen, ori);
				var yc2 = coo(curAng, pinRad + pinLen, ori);
				var xc3 = xc2 + offset;
				var yc3 = yc2;
				var xc = xc3 + offset / 2;
				var yc = yc2 + ( curAng === 90 ? - 5 : curAng === 270 ? 5 : 0) ;
				var lstyle = {
					textAnchor: curAng === 90 || curAng === 270 ? 'center' : 
							curAng > 90 && curAng < 270 ? 'end' : 'start'
				};
				if(pinDraw){
					var lpath = 'M' + xc1 + ',' + yc1 +  ' L' + xc2 + ',' + yc2 +  ' L' + xc3 + ',' + yc3;
					out.push(<path key={p + '.ll'} strokeWidth='1' stroke='black' fill='none' d={lpath}/>);
				}
				out.push(<text fontSize={pfs} key={p + '.l'} x={xc} y={yc} style={lstyle}>{label}</text>);
			}
			x = x2;
			y = y2;
			oldT += theta;
		}

		return <g>{out}</g>;
	}
});

module.exports = Pie;
