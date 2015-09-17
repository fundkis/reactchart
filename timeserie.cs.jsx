var React = require('react');
var Graph = require('./Graph.cs.jsx');



module.exports = React.createClass({
	getDefaultProps: function() {
		return {
			// general
			height: '500',		// defines the universe's height
			width: '500',		// defines the universe's width
			data: {series:[{ type : 'Plain', data : {series:[]}, axe : 'left', color: 'black'}], type: 'date'},
			title: '',
			titleFSize: 30,
			name: 'time',
			// axis
				// label of axis
			xLabel: 'Temps',
			yLabel: '',
			xLabelFSize: 15,
			yLabelFSize: 15,
				// axis
			axis: undefined,	// left = (bottom,left), right = {top,right}, overrides x,y-axis
			xaxis: 'bottom',	// bottom || top
			yaxis: 'left',		// left || right
				// margins
			axisMargin: {l: 10, b: 10, r: 10, t: 10}, // left, bottom, right, top
			outerMargin: {},        // left, bottom, right, top
			// lower level descriptions
			axisProps: {},
		};
	},
	render: function(){
		// we imposed some stuff, whatever the user says
		var props = this.props;
		props.data.type = 'date';
		var graphP = this.props.graphProps;
		props.graphProps = [];
		props.axisProps = this.props.axisProps;
		props.axisProps.majorGrid = {x:true, y:false};
		props.axisProps.label = {};
		props.name = this.props.name;
		for(var i = 0; i < this.props.data.series.length; i++){
			props.graphProps.push({
				color:     this.props.data.series[i].color || graphP[i].color || 'black', 
				mark:      graphP[i].mark                  || false, 
				markSize:  graphP[i].markSize              || 3, 
				markColor: graphP[i].markColor             || this.props.data.series[i].color || 'black'
			});
		}
		return <Graph {...props}/>;
	}
});
