var React = require('react');
var Tick = require('./Tick.cs.jsx');
var AxisLine = require('./AxisLine.cs.jsx');
var ticker = require('./ticker.cs.js');
var _ = require('underscore');
var utils = require('../core/utils.cs.js');
var sp = require('../core/space-transf.cs.js');

var Axe = React.createClass({
	shouldComponentUpdate: function(props){
		return props !== this.props;
	},

	points: function(){
		var length = (this.props.ds.c.max - this.props.ds.c.min);
		return {
					start: this.props.origin,
					end: {
						x: this.props.origin.x + this.props.dir.x * length,
						y: this.props.origin.y + this.props.dir.y * length
					}
				};
	},

	grid: function(){
		var ds = this.props.ds;
		var majProps = this.props.ticks.major;
		var minProps = this.props.ticks.minor;
		var majGrid = this.props.grid.major;
		var minGrid = this.props.grid.minor;
		var minor = (this.props.ticks.minor.show === true || this.props.grid.minor.show === true);
		var axisDir = this.props.dir;
		var labelDir = this.props.labelDir;
		var origin = this.props.origin;

		return _.map(ticker.ticks(ds.d.min,ds.d.max,this.props.ticksLabel,minor,this.props.comFac), (tick,idx) => {
			var cstick = {};
			cstick.where = {
				x: origin.x + (sp.toC(ds,tick.where) * axisDir.x - origin.x) * axisDir.x,
				y: origin.y + (sp.toC(ds,tick.where) * axisDir.y - origin.y) * axisDir.y
			};
			cstick.labelOffset = {
				x: sp.toCwidth(ds,tick.offset.along) * axisDir.x + tick.offset.perp * axisDir.y * majGrid.length,
				y: sp.toCwidth(ds,tick.offset.along) * axisDir.y + tick.offset.perp * axisDir.x * majGrid.length
			};
			for(var pr in tick){
				if(pr === 'where' || pr === 'labelOffset'){continue;}
				cstick[pr] = utils.deepCp({},tick[pr]);
			}
			// for grid length, just in case
			if(!!cstick.grid){
				cstick.grid.length = minGrid.length;
			}
			var p = tick.minor ? minProps : majProps;
			p.labelDir = labelDir;
			if(!utils.isNil(tick.extra)){
				p.width = 0;
			}
			p.grid = tick.minor ? minGrid.show ? minGrid: null : majGrid.show ? majGrid: null;

			if(!utils.isNil(p.labelize) && typeof p.labelize === 'function' ){
				cstick.label = p.labelize(tick.where);
			}
			var k = 'tick.' + idx;
			return <Tick key={k} {...p} {...cstick}/>;
		});
	},

	render: function(){

		// initialize
		this.ticker = null;

		return <g>
			{this.grid()}
			<AxisLine {...this.props.axisLine}/>
			</g>;
}
});

module.exports = Axe;
