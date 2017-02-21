let React = require('react');
let _ = require('underscore');

let iconer = require('../icons/iconer.js');
let color = require('./colorMgr.js');

let process = function(props){

	let icW = props.legend.iconWidth + props.legend.iconUnit;
	let icH = props.legend.iconHeight + props.legend.iconUnit;

	// for icon, just to help reading
	let icw  = props.legend.iconWidth  - 2 * props.legend.iconHMargin;
	let ich  = props.legend.iconHeight - 2 * props.legend.iconVMargin;
	let ichm = props.legend.iconHMargin;
	let icvm = props.legend.iconVMargin;

	let getALegend = (data,gprops,idx) => {
		let icc = gprops.color;
		let sha = gprops.shader;
		if(!!sha && !!sha.options){
			sha.computation = sha.computation === 'by function' ? sha.computation : 'explicit';
			sha.type = 'color';
			sha.factor = [0.5];
			let col = {};
			color(sha,[col]);
			icc = col.color;
		}
		let ics = gprops.width < 2 ? gprops.width * 1.5 : gprops.width; // slightly more bold, if needed
		let iconProps = {
			color: icc,
			width: icw,
			height: ich,
			hMargin: ichm,
			vMargin: icvm,
			strokeWidth: ics
		};
		let perPoint = [];
		if (data.series) {
			for(let p = 0; p < data.series.length; p++){
				if(!!data.series[p].legend){
					let point = data.series[p];
					let typeMark = gprops.markType;
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

	let leg = [];
	for(let i = 0; i < props.data.length; i++){
		leg.push(getALegend(props.data[i],props.graphProps[i],i));
	}

	return _.flatten(leg);
};

module.exports = process;
