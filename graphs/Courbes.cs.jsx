var React = require('react');
var _ = require('underscore');
var marker = require('../marks/marker.cs.jsx');
var space = require('../core/space-transf.cs.js');

module.exports = React.createClass({
	propTypes: {
		mark: React.PropTypes.bool
	},
	getDefaultProps: function(){
		return {
			stroke: 'black',
			strokeWidth: '1',
			fill: 'none',
			mark: true,
			markType: 'dot',
			markProps: {},
			points: [],
			drops: [],
			dsx: {}, // see space-mgr for details
			dsy: {}  // see space-mgr for details
			};
	},
	render: function(){
		var dsx = this.props.dsx;
		var dsy = this.props.dsy;

		var datas = [{x:0,y:0}]; // dealing with empty values
		if(this.props.points.length > 0){
			datas = _.map(this.props.points, function(point){
				return {
					x: space.toC(dsx,point.x), 
					y: space.toC(dsy,point.y)
				};
			});
		}

		var points = 'M '+ datas[0].x + ' ' + datas[0].y; // init
		for(var i = 1; i < this.props.points.length; i++){
			points += ' L ' + datas[i].x + ' ' + datas[i].y;
		}

		// we close the curve, nothing is printed
		var props = this.props;
		var drops = (this.props.drops.length === 0)?_.map(this.props.points,function(/*point*/){return props.dsy.c.min;}):this.props.drops;
		for(i = drops.length - 1; i >= 0; i--){
			points += ' M ' + datas[i].x + ' ' + drops[i];
		}

      // marks
      var marks = marker.marks(datas,this.props.markProps,this.props.mark,this.props.markType);

		return (<g>
			<path 
				d={points} 
				stroke={this.props.stroke} 
				strokeWidth={this.props.strokeWidth}
				fill={this.props.fill}/>
			<g>{marks}</g>
			</g>
);
}
});
