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
		if(props.show === false){
			return null;
		}
		var axisProps = utils.deepCp(axisProps,props);

		// dir
		switch(axisProps.placement){
			case 'bottom':
				axisProps.dir = {x: 1, y: 0};
				axisProps.labelDir = {x:0, y: 1};
				break;
			case 'top':
				axisProps.dir = {x: 1, y: 0};
				axisProps.labelDir = {x:0, y: -1};
				break;
			case 'left':
				axisProps.dir = {x: 0, y: 1};
				axisProps.labelDir = {x: -1, y: 0};
				break;
			case 'right':
				axisProps.dir = {x: 0, y: 1};
				axisProps.labelDir = {x: 1, y: 0};
				break;
			default:
				throw new Error('Placement of axis unknown, check axis: ' + key);
		}
		// origin
		var curDir = (axisProps.dir.x === 0) ? 'y':'x';
		var othDir = (axisProps.dir.x === 0) ? 'x':'y';
		var idx = (utils.isNil(axisProps.partner)) ? 0: axisProps.partner;
		var partners = (key[0] === 'a') ? this.props.ord : this.props.abs;
		axisProps.origin = {};
		axisProps.origin[curDir] = axisProps.ds.c.min;
		axisProps.origin[othDir] = partners[idx].ds.c.min;
		axisProps.grid.major.length = Math.abs(partners[idx].ds.c.max - partners[idx].ds.c.min);
		axisProps.grid.minor.length = Math.abs(partners[idx].ds.c.max - partners[idx].ds.c.min);

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
				{this.ordinate()}
			</g>;
	}

});

module.exports = Axes;
