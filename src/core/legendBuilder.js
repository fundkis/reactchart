var React = require('react');
var _ = require('underscore');

var iconer = require('../icons/iconer.js');
var color = require('./colorMgr.js');

var process = function(props){

	var icW = props.legend.iconWidth + props.legend.iconUnit;
	var icH = props.legend.iconHeight + props.legend.iconUnit;

	// for icon, just to help reading
	var icw  = props.legend.iconWidth  - 2 * props.legend.iconHMargin;
	var ich  = props.legend.iconHeight - 2 * props.legend.iconVMargin;
	var ichm = props.legend.iconHMargin;
	var icvm = props.legend.iconVMargin;

	var getALegend = (data,gprops,idx) => {
		var icc = gprops.color;
		var sha = gprops.shader;
		if(!!sha && !!sha.options){
			sha.computation = sha.computation === 'by function' ? sha.computation : 'explicit';
			sha.type = 'color';
			sha.factor = [0.5];
			var col = {};
			color(sha,[col]);
			icc = col.color;
		}
		var ics = gprops.width < 2 ? gprops.width * 1.5 : gprops.width; // slightly more bold, if needed
		var iconProps = {
			color: icc,
			width: icw,
			height: ich,
			hMargin: ichm,
			vMargin: icvm,
      strokeWidth: ics
		};
		var perPoint = [];
		if (data.series) {
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
		}

		return perPoint.length !== 0 ? perPoint :
			{
				icon: <svg width={icW} height={icH}>
						{gprops.onlyMarks ? null : iconer.icon(iconProps, 'line')}
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
