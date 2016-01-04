var React = require('react');
var Axe = require('./Axe.cs.jsx');
var aProps = require('../core/proprieties.cs.js');
var _ = require('underscore');
var utils = require('../core/utils.cs.js');

/*
 * The Axes environment basically just
 * manage the axis' details and pass
 * them to the Axe environment.
 *
 * It contains all the props, it is
 * explicit.
 *
 */
var Axes = React.createClass({
	getDefaultProps: function(){
		return aProps.Axes;
	},

	abscissa: function(){
		var axis = this.axis;
		return _.map(this.props.abs, (p,idx) => {return axis(p,'a.' + idx);});
	},

	ordinate: function(){
		var axis = this.axis;
		return _.map(this.props.ord, (p,idx) => {return axis(p,'o.' + idx);});
	},

	axis: function(props,key){
		var axisProps = utils.deepCp(props);
		var partners = (key[0] === 'a') ? this.props.ord : this.props.abs;
		if(utils.isNil(axisProps.partner)){
			axisProps.origin = { x: axisProps.ds.c.min, y: partners[0].ds.c.min};
		}else{
			axisProps.origin = { x: axisProps.ds.c.min, y: partners[axisProps.partner].ds.c.min};
		}
		switch(axisProps.placement){
			case 'bottom':
				axisProps.dir = {x:1, y: 0};
				axisProps.labelDir = {x:0, y: 1};
				break;
			case 'top':
				axisProps.dir = {x:1, y: 0};
				axisProps.labelDir = {x:0, y: -1};
				break;
			case 'left':
				axisProps.dir = {x:0, y: -1};
				axisProps.labelDir = {x:-1, y: 0};
				break;
			case 'right':
				axisProps.dir = {x:0, y: -1};
				axisProps.labelDir = {x:1, y: 0};
				break;
			default:
				throw new Error('Placement of axis unknown, check axis: ' + key);
		}

		if(!utils.isDate(axisProps.ds.d.max) && axisProps.ds.d.max > 1e3){
			var mgr = utils.mgr(axisProps.ds.d.max);
			var om = mgr.orderMag(axisProps.ds.d.max);
			axisProps.comFac = Math.pow(10,om);
		}

		return <Axe key={key} {...axisProps} CS={this.props.CS}/>;
	},

	render: function(){

		return <g>
				{this.abscissa()}
				{this.ordinates()}
			</g>;
	}

});

module.exports = Axes;
