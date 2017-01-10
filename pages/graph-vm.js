let React = require('react');
let h = require('../src/core/utils.js');
let _ = require('underscore');
let generator = require('./generator.js');
let utils = require('../src/helpers.js');

let m = {};

m.create = function(){

	let pi2 = 2 * Math.PI;

	let data = _.times(1000, (n) => {
		return {
			x: pi2/999 * n,
			y: Math.sin(pi2/999*n)
		};
	 });

	let dataS1 = [
		{x: 1, y: 3, label: {x: 'Premier'}},
		{x: 2, y: 2, label: {x: 'Second'}},
		{x: 3, y: 6, label: {x: 'Troisième'}},
		{x: 4, y: 1, label: {x: 'Quatrième'}}
	];

	let dataS2 = [
		{x: 1, y: 2, label: {x: 'Premier'}},
		{x: 2, y: 1, label: {x: 'Second'}},
		{x: 3, y: 3, label: {x: 'Troisième'}},
		{x: 4, y: 9, label: {x: 'Quatrième'}}
	];

	let dataS3 = [
		{x: 1, y: 0, label: {x: 'Premier'}},
		{x: 2, y: 2, label: {x: 'Second'}},
		{x: 3, y: 4, label: {x: 'Troisième'}},
		{x: 4, y: 5, label: {x: 'Quatrième'}}
	];

	let dataS4 = [
		{x: 1, y: 1, label: {x: 'Premier'}},
		{x: 2, y: 3, label: {x: 'Second'}},
		{x: 3, y: 7, label: {x: 'Troisième'}},
		{x: 4, y: 6, label: {x: 'Quatrième'}}
	];

	let common = () => {
		return {
			height: 400,
			width: 550
		};
	};

	let multiHisto = () => {
		let data= [];
		for(let y = 2015; y < 2017; y++){
			for(let m = 0; m < 12; m++){
				for(let n = 0; n < 1000; n++){
					data.push({
						x: new Date(y,m),
						y: y === 2015 ? m < 7 ? generator.Marsaglia(1.5,2) : generator.unidev_01() * m : m < 7 ? generator.directBeta(2,5) * (12 - m) : generator.BoxMuller(5,3)
					});
				}
			}
		}
		return data;
	};

	let pieProps = {
		name: 'Pie',
		height: 400,	// defines the universe's height
		width:	450,	// defines the universe's width
		titleFSize: 30,
		// cadre: true,
		// margins
		outerMargin: {left: 40, bottom: 40, right: 40, top: 40}, // left, bottom, right, top
		// data
		data: [
			{
				type: 'Pie',
				series: [
					{value: 35, legend: 'One'},
					{value: 40, legend: 'Two'},
					{value: 40, legend: 'Two'},
					{value: 40, legend: 'Two'},
					{value: 40, legend: 'Two'},
					{value: 40, legend: 'Two'},
					{value: 40, legend: 'Two'},
					{value: 4,	legend: 'Three'}
				]
			}
		],
		graphProps: [
			{
				pie: 'disc', // tore
				pieOrigin: {x: 0, y:0}, // in case several graphs, offset from center
				pieRadius: 160,
				tag: {
					show: true,
					pin: true
				}
			}
		],
		//outerMargin: {left: 50, right: 50},
		chgSerie: '[{value, legend}]'
	};
	let toreProps = h.deepCp({},pieProps);
	toreProps.graphProps[0].pieToreRadius = 0.5;
	toreProps.graphProps[0].pie = 'tore';
	toreProps.name = 'Tore';

	let plainProps = _.extend(common(), {
		name: 'PlainNoMarks',
		data: [{series: data}],
		graphProps: [{mark: false}],
		chgSerie: '[{x, y}, ...]'
	});

	let plainDProps = _.extend(common(), {
		name: 'Default',
		data: [{series: _.sample(data, 100).sort( (a,b) => a.x - b.x)}],
		graphProps: [{}],
		chgSerie: '[{x, y}, ...]'
	});

	let fillProps = _.extend(common(), {
		name: 'Integral',
		data: [{series: data}],
		graphProps: [{mark: false, fill: 'lightblue'}],
		chgSerie: '[{x, y}, ...]'
	});

	let fill2Props = _.extend(common(), {
		name: 'Integral2',
		data: [{series: _.map(data, (p) => {return {x: p.x, y: p.y + 1};})}],
		graphProps: [{mark: false, fill: 'teal'}],
		chgSerie: '[{x, y}, ...]'
	});

	let stackedProps = _.extend(common(), {
		name: 'Stacked',
		data: [
			{series: dataS1, stacked: 'y'}, 
			{series: dataS2, stacked: 'y'}, 
			{series: dataS3, stacked: 'y'}, 
			{series: dataS4, stacked: 'y'}, 
		],
		graphProps: [
			{onlyMarks: true, color: 'blue',   markType: 'bar'},
			{onlyMarks: true, color: 'red',    markType: 'bar'},
			{onlyMarks: true, color: 'orange', markType: 'bar'},
			{onlyMarks: true, color: 'violet', markType: 'bar'}
		],
		chgSerie: '[{x, y, label: { x } }, ...]'
	});

	let dataH = (tag) => [{x: 1.5, y: 6.5, tag }];
	let markH = (ang,big) => {
		return {onlyMarks: true, markSize: big ? 5 : 0, color: 'lightgray', tag: {show: true, pinAngle: ang, pin: true, pinLength: 15, fontSize: 15}};
	};

	let tagProps = _.extend(common(), {
		name: 'Tagged',
		data: [
			{series: _.map(dataS1, (p) => {return {x: p.x, y: p.y, tag: p.label.x};})},
			{series: _.map(dataS2, (p) => {return {x: p.x, y: p.y, tag: p.label.x};})},
			{series: _.map(dataS3, (p) => {return {x: p.x, y: p.y, tag: p.label.x};})},
			{series: _.map(dataS4, (p) => {return {x: p.x, y: p.y, tag: p.label.x};})},
//
			{series: dataH('left')},
			{series: dataH('right')},
			{series: dataH('up')},
			{series: dataH('down')}
		],
		graphProps: [
			{color: 'blue',   onlyMarks: true, tag: {show: true, pin: true, pinColor: 'blue'}},
			{color: 'red',    onlyMarks: true, tag: {show: true, pinAngle: -60, pin: true, pinLength: 20, pinHook: 10}},
			{color: 'orange', onlyMarks: true, tag: {show: true, pin: true, pinColor: 'orange', pinAngle: -90, color: 'orange', pinHook: 0}},
			{color: 'violet', onlyMarks: true, tag: {show: true, pinAngle: 180, pin: true}},
//
			markH(180, true),
			markH(0),
			markH(90),
			markH(-90)
		],
		axisMargin: {left: 55, right: 70, top: 20, bottom: 40},
		chgSerie: '[{x, y, tag}, ...]'
	});

	let histoProps = _.extend(common(), {
		name: 'Histogram',
		data: [{type: 'Stairs', series: _.map(data, (p) => {return {value: p.y};})}],
		graphProps: [{dropLine: {y: true}, mark: false, fill: 'lightblue', process: {type: 'histogram'}}],
		axisOnTop: true,
		chgSerie: '[{value}, ...]'
	});

	let mHistoProps = _.extend(common(), {
		name: 'Multi_histogram',
		data: [{series: multiHisto(), abs: {type: 'date'}}],
		graphProps: [{markType: 'bar', onlyMarks: true, color: 'darkblue', process: {type: 'histogram', dir: 'y'}}],
		chgSerie: '[{x, y}, ...]'
	});

	let plainOMProps = _.extend(common(), {
		name: 'ColorMaks',
		data: [{series: _.sample(data,100)}],
		graphProps: [{onlyMarks: true, markColor: 'cyan'}],
		chgSerie: '[{x, y}, ...]'
	});

	let plainOMSProps = _.extend(common(), {
		name: 'ShadedMaks',
		data: [{series: _.sample(data, 100).sort((a,b) => a.x - b.x)}],
		graphProps: [{markType: 'square', onlyMarks: true, shader: {type: 'color', computation: 'by index', options: {colors: ['#FFCD12','#FF1010']}}}],
		chgSerie: '[{x, y}, ...]'
	});


	let proc = (prop) => {

		let print = (p) => {
			let out = Array.isArray(p) ? p.concat() : _.extend({},p);
			for(let u in p){
				if(u === 'series'){
					out[u] = prop.chgSerie;
					continue;
				}else if(typeof p[u] === 'object'){
					out[u] = print(p[u]);
				}
			}
			return out;
		};

		let tmp = print(prop);
		delete tmp.chgSerie;
		return tmp;
	};

  let dynChart = utils.init(_.extend(common(), {
    name: 'dyn',
    data: [{series: [{x: 0, y:0}]}],
    graphProps: [{onlyMarks:true, color: 'blue', markSize: 2}],
    axisProps: {
      abs: [{min: 0, max: pi2}],
      ord: [{min: -1.1, max: 1.1}],
    },
    foreground: {
      content: () => React.createElement('text',null,'#data points: 0'),
      ix: 0.6,
      iy: 0.9
    }
  }));

  let dynModel = dynChart.props().curves[0].marks[0];
  let dynModelize = (point,idx) => _.extend(_.extend({},dynModel),{position: point, key: "Plain.0.d." + idx});
  let dynDone = true;
  let dynHowTo = "Using the helpers: <pre>let utils = require('reactchart/helpers');\nlet mgr = utils.init(graph proprieties here); </pre>We pass the mgr to the chart: <pre>&lt;ReactChart {...mgr} /&gt;</pre>, then we change the immutable props at <pre>mgr.props()</pre> using freezer API, and the chart updates all by itself.";

  let dynLaunch = () => {
    if(!dynDone){return;}
    dynDone = false;
    let d = 0;
    let oneMore = (idx) => dynChart.props().pivot()
      .foreground.set('content',() => React.createElement('text',null,'#data points: ' + d))
      .curves[0].marks.push(dynModelize(data[2*idx],idx));
    let add = () => setTimeout(() => {
      oneMore(d);
      d++;
      return d < data.length/2 ? add() : dynDone = true;
    },
    0);
    dynChart.props().curves[0].set('marks',[]);
    add();
  };

	let toShow = (props) => JSON.stringify(proc(props),null,2);

	let parse = (str) => '<pre>' + str + '</pre>';

	return {
		pie: pieProps,
		pieP: {
			__html: parse(toShow(pieProps)),
			title: 'Code'
		},
		tore: toreProps,
		toreP: {
			__html: parse(toShow(toreProps)),
			title: 'Code'
		},
		plain: plainProps,
		plainP:  {
			__html: parse(toShow(plainProps)),
			title: 'Code'
		},
		plainD: plainDProps,
		plainDP:	{
			__html: parse(toShow(plainDProps)),
			title: 'Code'
		},
		fill: fillProps,
		fillP:	{
			__html: parse(toShow(fillProps)),
			title: 'Code'
		},
		fill2: fill2Props,
		fill2P:  {
			__html: parse(toShow(fill2Props)),
			title: 'Code'
		},
		stack: stackedProps,
		stackP:  {
			__html: parse(toShow(stackedProps)),
			title: 'Code'
		},
		tag: tagProps,
		tagP:  {
			__html: parse(toShow(tagProps)),
			title: 'Code'
		},
		plainOM: plainOMProps,
		plainOMP: {
			__html: parse(toShow(plainOMProps)),
			title: 'Code'
		},
		plainOMS:  plainOMSProps,
		plainOMSP: {
			__html: parse(toShow(plainOMSProps)),
			title: 'Code'
		},
		histo:	histoProps,
		histoP: {
			__html: parse(toShow(histoProps)),
			title: 'Code'
		},
		mHisto:  mHistoProps,
		mHistoP: {
			__html: parse(toShow(mHistoProps)),
			title: 'Code'
		},
    dyn: dynChart,
    dynP: {
			__html: dynHowTo,
			title: 'Dynamic'
    },
    dynLaunch: dynLaunch
	};
};

module.exports = m;
