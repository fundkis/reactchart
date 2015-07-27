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
			
		var points = '';
		for(var i = 0; i < this.props.points.length; i++){
			points += ((i === 0)?'M ':'L ') + datas[i].x + ' ' + datas[i].y + ' ';
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
