var React = require('react');
var _ = require('underscore');

var iconer = require('../icons/iconer.cs.js');
var color = require('./colorMgr.cs.js');

var process = function(props){

	var icW = props.legend.iconWidth + props.legend.iconUnit;
	var icH = props.legend.iconHeight + props.legend.iconUnit;
	var icx = props.legend.iconHMargin + props.legend.iconUnit;
	var icx1 = (props.legend.iconWidth - props.legend.iconHMargin) + props.legend.iconUnit;
	var icy = (props.legend.iconHeight/2) + props.legend.iconUnit;

	// for icon, just to help reading
	var icw  = props.legend.iconWidth  - 2 * props.legend.iconHMargin;
	var ich  = props.legend.iconHeight - 2 * props.legend.iconVMargin;
	var ichm = props.legend.iconHMargin;
	var icvm = props.legend.iconVMargin;

	var getALegend = (data,gprops,idx) => {
		var icc = gprops.color;
		var sha = gprops.shader;
		if(!!sha){
			sha.computation = 'explicit';
			sha.type = 'color';
			sha.factor = [0.5];
			var col = {};
			color(sha,[col]);
			icc = col.color;
		}
		var ics = gprops.width;
		var iconProps = {
			color: icc, 
			width: icw, 
			height: ich, 
			hMargin: ichm, 
			vMargin: icvm
		};
		var perPoint = [];
		for(var p = 0; p < data.series.length; p++){
			if(!!data.series[p].legend){
				var point = data.series[p];
				var typeMark = gprops.markType;
				iconProps.color = point.color || color(p);
				perPoint.push({
					icon: <svg width={icW} height={icH}>
							{iconer.icon(iconProps, typeMark)}
						</svg>,
					label: point.legend || 'data #' + idx
				});
			}
		}

		return perPoint.length !== 0 ? perPoint : 
			{
				icon: <svg width={icW} height={icH}>
						{gprops.onlyMarks ? null : <line x={icx} y={icy} x1={icx1} y1={icy} stroke={icc} strokeWidth={ics}/>}
						{gprops.mark ? iconer.icon(iconProps, gprops.markType) : null}
					</svg>,
				label: gprops.name || 'graph #' + idx
			};
	};

	var leg = [];
	for(var i = 0; i < props.data.length; i++){
		leg.push(getALegend(props.data[i],props.graphProps[i],i));
	}

	return _.flatten(leg);
};

module.exports = process;
