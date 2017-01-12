let React = require('react');
let utils = require('../src/helpers.js');
let _ = require('underscore');
let h = require('../src/core/utils.js');

let m = {};

m.create = function(){

	let common = () => {
		return {
			height: 230,
			width: 250,
			axisProps: {
				abs: [{min: 0, max: pi2}],
				ord: [{min: -1.1, max: 1.1}],
			},
			title: "#data points: 0",
			titleFSize: 15,
		};
	};

	let pi2  = 2 * Math.PI;

	let data = _.times(1000, (n) => {
		return {
			x: pi2/999 * n,
			y: Math.sin(pi2/999*n)
		};
	 });
	let dataC = _.times(1000, (n) => {
		return {
			x: pi2/999 * n,
			y: Math.cos(pi2/999*n)
		};
	 });
	let dataS = _.times(1000, (n) => {
		return {
			x: pi2/999 * n,
			y: -Math.sin(pi2/999*n)
		};
	 });
	let dataC2 = _.times(1000, (n) => {
		return {
			x: pi2/999 * n,
			y: -Math.cos(pi2/999*n)
		};
	 });

	let dynChart1 = utils.init(_.extend(common(), {
		name: 'dyn1',
		data: [
			{series: [{x: 0, y:0}]}
		],
		graphProps: [
			{onlyMarks: true, color: 'blue',   markSize: 1}
		]
	}));

	let dynChart2 = utils.init(_.extend(common(), {
		name: 'dyn2',
		data: [
			{series: [{x: 0, y:0}]},
			{series: [{x: 0, y:0}]}
		],
		graphProps: [
			{onlyMarks: true, color: 'blue',   markSize: 1},
			{onlyMarks: true, color: 'red',    markSize: 1}
		]
	}));

	let dynChart3 = utils.init(_.extend(common(), {
		name: 'dyn3',
		data: [
			{series: [{x: 0, y:0}]},
			{series: [{x: 0, y:0}]},
			{series: [{x: 0, y:0}]}
		],
		graphProps: [
			{onlyMarks: true, color: 'blue',   markSize: 1},
			{onlyMarks: true, color: 'red',    markSize: 1},
			{onlyMarks: true, color: 'green',  markSize: 1}
		]
	}));

	let dynChart4 = utils.init(_.extend(common(), {
		name: 'dyn4',
		data: [
			{series: [{x: 0, y:0}]},
			{series: [{x: 0, y:0}]},
			{series: [{x: 0, y:0}]},
			{series: [{x: 0, y:0}]}
		],
		graphProps: [
			{onlyMarks: true, color: 'blue',   markSize: 1},
			{onlyMarks: true, color: 'red',    markSize: 1},
			{onlyMarks: true, color: 'green',  markSize: 1},
			{onlyMarks: true, color: 'violet', markSize: 1}
		]
	}));

	let dynChartCount = utils.init({
		height: 400,
		width: 550,
		name: 'dynC',
		data: [
			{series: [{x: 0, y:0}]},
			{series: [{x: 0, y:0}]},
			{series: [{x: 0, y:0}]},
			{series: [{x: 0, y:0}]},
			{series: [{x: 0, y:0}]},
			{series: [{x: 0, y:0}]},
			{series: [{x: 0, y:0}]},
			{series: [{x: 0, y:0}]}
		],
		graphProps: [
			{onlyMarks: true, color: 'blue',        markSize: 1},
			{onlyMarks: true, color: 'red',         markSize: 1},
			{onlyMarks: true, color: 'green',       markSize: 1},
			{onlyMarks: true, color: 'purple',      markSize: 1},
			{onlyMarks: true, color: 'lightblue',   markSize: 1},
			{onlyMarks: true, color: 'pink',        markSize: 1},
			{onlyMarks: true, color: 'greenyellow', markSize: 1},
			{onlyMarks: true, color: 'violet',      markSize: 1}
		],
		axisProps: {
			abs: [{min: 0, max: 1020, label: 'Index', ticks: {major: { labelize: x => x.toFixed(0) } } }],
			ord: [{min: 0, max: 61, label: 'Time (s)'}],
		}
	});

	let dynModel = _.map(dynChart4.props().curves, (cur) => h.deepCp({},cur.marks[0]))
		.concat(_.map(dynChartCount.props().curves, (cur) => h.deepCp({},cur.marks[0])));

	let rekey = (c,i) => {
		let k = dynModel[c].key.split('.');
		k[k.length - 1] = i;
		return k.join('.');
	};
	let dynModelize = (point,c,idx,off) => h.deepCp(h.deepCp({},dynModel[c + (off || 0)]),{position: point, key: rekey(c + (off || 0) , idx)});

	let dynDone = [true, true, true, true];
	let dynHowTo = "Using the helpers: <pre>let utils = require('reactchart/helpers');\nlet mgr = utils.init(graph proprieties here); </pre>We pass <code>mgr</code> to the chart: <pre>&lt;ReactChart {...mgr} /&gt;</pre>, then we change the immutable props at <code>mgr.props()</code> using freezer API, and the chart updates all by itself.";


	let upChart = (dynChart, who,d) => {
		let nData = (d + 1) * (who + 1) ;
		switch(who){
			case 0:
				dynChart.props().pivot()
					.title.set('title','#data points: ' + nData)
					.curves[0].marks.push(dynModelize(data[d],0,d));
				break;
			case 1:
				dynChart.props().pivot()
					.title.set('title','#data points: ' + nData)
					.curves[0].marks.push(dynModelize(data[d], 0,d))
					.curves[1].marks.push(dynModelize(dataC[d],1,d));
				break;
			case 2:
				dynChart.props().pivot()
					.title.set('title','#data points: ' + nData)
					.curves[0].marks.push(dynModelize(data[d], 0,d))
					.curves[1].marks.push(dynModelize(dataC[d],1,d))
					.curves[2].marks.push(dynModelize(dataS[d],2,d));
				break;
			case 3:
				dynChart.props().pivot()
					.title.set('title','#data points: ' + nData)
					.curves[0].marks.push(dynModelize(data[d],  0,d))
					.curves[1].marks.push(dynModelize(dataC[d], 1,d))
					.curves[2].marks.push(dynModelize(dataS[d], 2,d))
					.curves[3].marks.push(dynModelize(dataC2[d],3,d));
		}
	};

	let dynCharts = [dynChart1, dynChart2, dynChart3, dynChart4];

	let dynLaunch = (who,to) => {
		let dynChart = dynCharts[who];
		if(!dynDone[who]){return;}
		dynDone[who] = false;
		let d = 0;
		let offs = new Date().getTime();
		let prev;
		let oneMore = () => {
			upChart(dynChart,who,d);
			let t2 = new Date().getTime();
			let d2 = !!prev ? (t2 - prev)/5 : 0; // time for 200 points
			prev = t2;
			dynChartCount.props().curves[who].marks.push(dynModelize({x: d, y: (t2 - offs)/1000},who,d, 4));
			dynChartCount.props().curves[who].marks.push(dynModelize({x: d, y: d2 },who,d, 8));
		};
		let add = () => {
			let start = new Date().getTime();
			((t) => setTimeout(() => {
				oneMore(t);
				d++;
				return d < data.length ? add() : dynDone[who] = true;
			},
			to))(start);
		};
		for(let c = 0; c < dynChart.props().curves.length; c++){
			dynChart.props().curves[c].set('marks',[]);
		}
		dynChartCount.props().curves[who].set('marks',[]);
		add();
	};


	let dynChartSlide = utils.init({
		width: 450,
		height: 400,
		data: [{series: _.times(10000, (n) => {
			return {
				x: n,
				y: Math.sin(n)
			};
		})}],
		graphProps: [{onlyMarks: true, markSize: 1.5, color: 'blue'}],
		foreground: {
			x: 5000,
			y: Math.sin(5000),
			content: () => React.createElement('circle',{r: 4, fill: 'red', cx: 0, cy: 0})
		},
		axisProps: {
			abs: [{ticks: {major: { labelize: x => x.toFixed(0) } } }],
		}
	});

	let changeMe = (nval) => dynChartSlide.props().foreground.pivot().set('x',nval).set('y',Math.sin(nval));

	return {
		dyn1: dynChart1,
		dyn1P: {
			__html: dynHowTo,
			title: 'Dynamic one curve'
		},
		dyn2: dynChart2,
		dyn2P: {
			__html: dynHowTo,
			title: 'Dynamic two curves'
		},
		dyn3: dynChart3,
		dyn3P: {
			__html: dynHowTo,
			title: 'Dynamic three curves'
		},
		dyn4: dynChart4,
		dyn4P: {
			__html: dynHowTo,
			title: 'Dynamic four curves'
		},
		dynC: dynChartCount,
		dynCP: {
			body: "The darker colors are the time at which the charts are updated, the lighter colors are the time necessary at the measured instantaneous speed to print 200 data points.",
			title: 'Measure of performances'
		},
		dynLaunch: dynLaunch,
		slide: {
			graph: dynChartSlide,
			changeSL: changeMe
		}
	};

};

module.exports = m;
