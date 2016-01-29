var ticker = require('./ticker.cs.js');
var sp = require('./space-transf.cs.js');


	graphs: function(){

		// printing the graph
		var prints = [];
		for(var m = 0; m < this.props.data.length; m++){
			var graphProps = this.props.graphProps[m];

			// we add the world
			// we find the proper x & y axis
			var xplace = 'bottom';
			if(!!this.props.data[m].abs && 
				!!this.props.data[m].abs.axis){
				xplace = this.props.data[m].abs.axis;
			}

			var yplace = 'left';
			if(!!this.props.data[m].ord && 
				!!this.props.data[m].ord.axis){
				yplace = this.props.data[m].ord.axis;
			}

			graphProps.dsx = this.state.spaces.x[xplace];
			graphProps.dsy = this.state.spaces.y[yplace];
			for(var more in this.state.spanOffset[m]){
				graphProps[more] = this.state.spanOffset[m][more];
			}

			var points = this.state.series[m].concat();

			// shader
			shader(graphProps.shader,points);

			// we add the key (it's a vector)
			graphProps.name = this.props.name + '.g.' + m;
			var type = this.props.data[m].type || 'Plain';
			prints.push(grapher.grapher(type,points,graphProps));
		}
		return prints;
	},

	axis: function(){
	/* DS = {
	 *	y: {
	 *		left:  space(lefts, universe.height,bordersy,title),
	 *		right: space(rights,universe.height,bordersy,title)
	 *	}, 
	 *	x: {
	 *		bottom: space(bottom,universe.width,bordersx),
	 *		top:  space(top, universe.width,bordersx)
	 *	}
	 * }
	 */
		var DS = this.state.spaces;
		var c  = {abs: 'x', ord: 'y'};
		var def = {abs: 'bottom', ord: 'left'};

		// axis placement
		for(var t in c){
			for(var a = 0; a < props[t].length; a++){
				// defaulted at 'bottom' & 'left'
				if(!!props[t][a].placement){
					props[t][a].ds = DS[c[t]][props[t][a].placement];
				}else{
					props[t][a].placement = def[t];
					props[t][a].ds = DS[c[t]][props[t][a].placement];
				}
			}
		}

		// if labelled data
		for(var s = 0; s < this.state.series.length; s++){
			if(this.state.series[s].length === 0){continue;}
			var firstPoint = this.state.series[s][0];
			for(var k in c){
				var label = c[k] + 'label';
				if(!!firstPoint[label]){
					// default
					var look = def[k];
					if(!utils.isNil(this.props.data[s][k]) && !!this.props.data[s][k].axis){
						look = this.props.data[s][k].axis;
					}
					for(var ax = 0; ax < props[k].length; ax++){
						if(props[k][ax].placement === look){
							props[k][ax].ticksLabel = _.map(this.state.series[s],(point) => {return {coord: point[c[k]], label: point[label]};});
							break;
						}
					}
				}
			}
		}

		return <Axes name={nameAx} {...props} />;
	},

tick{
	 grid: {
		var gridColor = this.props.grid.color || 'grey';
		var gridWidth = this.props.grid.width || 2 / 3 * this.props.width;
	}

	label: {
		// label is out, further away by fontsize in y dir
		// adding a little margin
		// anchoring the text
		if(this.props.labelDir.y !== 0){
			yt += 5;
			if(this.props.labelDir.y > 0){
				yt += this.props.labelDir.y * fs;  // font size in the way (baseline is at the bottom of label)
			}
			textAnchor = 'middle';
		}

		if(this.props.labelDir.x !== 0){
			yt += fs/3; // baseline adjustment (until I know how to retrieve the depth of the label)
			if(this.props.labelDir.x < 0){
				xt -= 5;
				textAnchor = 'end';
			}else{
				xt += 5;
				textAnchor = 'start';
			}
		}

		// offset
		xt += this.props.labelOffset.x || 0;
		yt += this.props.labelOffset.y || 0;
	}
}

var axis = function(props,state,axe,dir){

	// for every abscissa
	var out = _.map(state.space[dir], (ds,key) => {

		if(utils.isNil(ds)){
			return null;
		}

		var find = (key) => {
			switch(key){
				case 'top':
				case 'right':
					return 'max';
				default:
					return 'min';
			}
		};

		// add here the common factor computations and definitions
		var comFac = 1;

		var axisProps = _.findWhere(props.axisProps[axe], {placement: key});
		axisProps.CS = props.axisProps.CS;

		var partnerAxis = props.axisProps.ord[axisProps.partner];
		var partnerDs = state.space.y[partnerAxis.placement];

		var othdir = dir === 'x' ? 'y' : 'x';
		var DS = {};
		DS[dir] = ds;
		DS[othdir] = partnerDs;
		partner = {
			pos: partnerDs.d[find(key)],
			length: partnerDs.d.max - partnerDs.d.min
		};
		var bounds = {min: ds.d.min, max: ds.d.max};

		return {
			axisLine: axisLine.VM(ds,axisProps,partnerDs,dir),
			ticks: ticks.VM(DS, partner, bounds, dir, axisProps, comFac)
		};
	});

	return _.reject(out, (val) => {return utils.isNil(val);});

};

m = {};

m.abscissas = function(props,state){
	return axis(props,state,'abs','x');
};

m.ordinates = function(props,state){
	return axis(props,state,'ord','y');
};

module.exports = m;
