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
			drops: {x:[], y:[]},
			dsx: {}, // see space-mgr for details
			dsy: {}  // see space-mgr for details
			};
	},
	render: function(){
		// getting values, easier
		var dsx = this.props.dsx;
		var dsy = this.props.dsy;
		var props = this.props;
		var dropsx = (this.props.drops.x.length === 0)?_.map(this.props.points,function(/*point*/){return 0.0;}):this.props.drops.x;
		var dropsy = (this.props.drops.y.length === 0)?_.map(this.props.points,function(/*point*/){return 0.0;}):this.props.drops.y;

		var datas = [{x:0,y:0}]; // dealing with empty values
		if(this.props.points.length > 0){
			datas = _.map(this.props.points, function(point,index){
				return {
					x: space.toC(dsx,point.x + dropsx[index]), 
					y: space.toC(dsy,point.y + dropsy[index])
				};
			});
		}

		var points = 'M '+ datas[0].x + ' ' + datas[0].y; // init
		for(var i = 1; i < this.props.points.length; i++){
			points += ' L ' + datas[i].x + ' ' + datas[i].y;
		}

		// we close the curve, nothing is printed
		for(i = dropsy.length - 1; i >= 0; i--){
			points += ' M ' + datas[i].x + ' ' + space.toC(dsy,dsy.d.min + dropsy[i]);
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
