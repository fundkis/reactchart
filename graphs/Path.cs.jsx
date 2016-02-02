var React = require('react');

var _ = require('underscore');
var space = require('../core/space-transf.cs.js');
var imUtils = require('../core/im-utils.cs.js');

/*
	 {
		show: true || false,
		ds: {
			x: {},
			y: {}
		},
		color: '',
		fill: '',
		width: ,
		shade: ,
		positions: [{x: , y: }],
		drops: [{x: , y: }],
		close: {
			x: true || false,
			y: true || false
		},
		dropLine: {
			x: true || false,
			y: true || false
		}
	}
*/

var Path = React.createClass({

	shouldComponentUpdate: function(props) {
		return !imUtils.isEqual(props,this.props);
	},


	render: function(){

    if(this.props.show === false || this.props.positions.length === 0){
      return null;
    }

		var ds = this.props.ds;
		var pos = this.props.positions;
		var drops = this.props.drops;

		var coord = (idx) => {
			return space.toC(ds.x,pos[idx].x) + ',' + space.toC(ds.y, pos[idx].y);
		};

		var dropx = (idx) => {
			return space.toC(ds.x,drops[idx].x) + ',' + space.toC(ds.y, pos[idx].y);
		};

		var dropy = (idx) => {
			return space.toC(ds.x,pos[idx].x) + ',' + space.toC(ds.y, drops[idx].y);
		};

		var points = 'M ' + coord(0);
		for(var i = 1; i < this.props.positions.length; i++){
			points += ' L ' + coord(i);
		}

		// we close the curve if wanted
		// y dir has prevalence
		if(this.props.close.y){
			for(i = drops.length - 1; i >= 0; i--){
				points += ' L ' + dropy(i);
			}
			points += 'z';
		}else if(this.props.close.x){
			for(i = drops.length - 1; i >= 0; i--){
				points += ' L ' + dropx(i);
			}
			points += 'z';
		}

// droplines
		var dropLines = [];
		var color = this.props.color;
		var width = this.props.width; 
		var shade = this.props.shade;

		if(this.props.dropLine.y){
			dropLines = _.map(this.props.positions,(pos,idx) => {
				var path = 'M ' + coord(idx) + ' L ' + dropy(idx);
				var key = this.props.key + '.dl.' + idx;
				return <path key={key} d={path} stroke={color} strokeWidth={width} opacity={shade}/>;
			});
		}
		if(this.props.dropLine.x){
			dropLines = _.map(this.props.positions,(pos,idx) => {
				var path = 'M ' + coord(idx) + ' L ' + dropx(idx);
				var key = this.props.key + '.dl.' + idx;
				return <path key={key} d={path} stroke={color} strokeWidth={width} opacity={shade}/>;
			});
		}

		return <g>
			<path
				d={points} 
				stroke={color} 
				strokeWidth={width}
				opacity={shade}
				fill={this.props.fill}/>
				{dropLines}
			</g>;
	}

});

module.exports = Path;
