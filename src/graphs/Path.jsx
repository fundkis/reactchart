var React = require('react');

var _ = require('underscore');
var space = require('../core/space-transf.js');
var imUtils = require('../core/im-utils.js');

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
		return !imUtils.isEqual(props.state,this.props.state);
	},


	render: function(){

		var state = this.props.state;

    if(state.show === false || state.positions.length === 0){
      return null;
    }

		var ds = state.ds;
		var pos = state.positions;
		var drops = state.drops;

		var coord = (idx) => space.toC(ds.x,pos[idx].x) + ',' + space.toC(ds.y, pos[idx].y);

		var dropx = (idx) => space.toC(ds.x,drops[idx].x) + ',' + space.toC(ds.y, pos[idx].y);

		var dropy = (idx) => space.toC(ds.x,pos[idx].x) + ',' + space.toC(ds.y, drops[idx].y);

		var points = 'M ' + coord(0);
		for(var i = 1; i < state.positions.length; i++){
			points += ' L ' + coord(i);
		}

		// we close the curve if wanted
		// y dir has prevalence
    let filling = points;
		if(state.close.y){
			for(i = drops.length - 1; i >= 0; i--){
				filling += ' L ' + dropy(i);
			}
		}else if(state.close.x){
			for(i = drops.length - 1; i >= 0; i--){
				filling += ' L ' + dropx(i);
			}
		}
		filling += 'z';

// droplines
		var dropLines = [];
		var color = state.color;
		var width = state.width; 
		var shade = state.shade;

		if(state.dropLine.y){
			dropLines = _.map(state.positions,(pos,idx) => {
				var path = 'M ' + coord(idx) + ' L ' + dropy(idx);
				var key = state.key + '.dl.' + idx;
				return <path key={key} d={path} stroke={color} strokeWidth={width} opacity={shade}/>;
			});
		}
		if(state.dropLine.x){
			dropLines = _.map(state.positions,(pos,idx) => {
				var path = 'M ' + coord(idx) + ' L ' + dropx(idx);
				var key = state.key + '.dl.' + idx;
				return <path key={key} d={path} stroke={color} strokeWidth={width} opacity={shade}/>;
			});
		}

		return <g>
			{state.close.y || state.close.x ? <path
				d={filling} 
				strokeWidth={0}
				opacity={shade}
				fill={state.fill}/> : null }
			<path
				d={points} 
				stroke={color} 
				strokeWidth={width}
				opacity={shade}
        fill='none'/>
				{dropLines}
			</g>;
	}

});

module.exports = Path;
