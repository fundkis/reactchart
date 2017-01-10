let React = require('react');
let _ = require('underscore');
let oneGraphVM = require('./one-graph-vm.js');
let grapher = require('fk-graph/helpers');

let m = {};

m.create = function(get){

	let vm = get;

	let generate = (n) => {
		let out = [];
		for(let i = 0; i < n; i++){
			out.push({
				x: i,
				y: Math.sin(i)
			});
		}
		return out;
	};

	let common = () => {
		return {
			width: '450', 
			height:'225', 
			data: [],
			graphProps: []
		};
	};

	// recompute all the time, no foreground
	let graphRN = (init) => init ? common() : _.extend(common(), {
		data:[
		{
			series: generate(vm().RN.N())
		},
		{
			series: [{x: Math.floor(vm().RN.where()), y: Math.sin(Math.floor(vm().RN.where()))}]
		}],
		graphProps: [
		{
			onlyMarks: true,
			markSize: 1,
			shader: {
				type: 'color',
				computation: 'explicit',
				options: {
					colors: ['#FFFFFF','#3A83F1']
				},
				factor: _.map(generate(vm().RN.N()), (p) => {return Math.abs(p.y);})
			}
		},
		{
			onlyMarks: true,
			color: 'red',
			markSize: 3
		}]
	});
	let updateGraphRN = (node) => node().reset(graphRN());

	// recompute all the time, foreground
	let graphRF = (init) => init ? common() : _.extend(common(), {
		data: [{
			series: generate(vm().RF.N())
		}],
		graphProps: [
		{
			onlyMarks: true,
			markSize: 1,
			shader: {
				type: 'color',
				computation: 'explicit',
				options: {
					colors: ['#FFFFFF','#3A83F1']
				},
				factor: _.map(generate(vm().RF.N()), (p) => {return Math.abs(p.y);})
			}
		}],
		foreground: {
			x: vm().RF.where(),
			y: Math.sin(vm().RF.where()),
			content: () => React.createElement('circle',{r: 3, fill: 'red', cx: 0, cy: 0})
		}
	});
	let updateGraphRF = (node) => node().reset(graphRF());

	// freezer, no foreground
	let graphFN = (init) => {
		let data = init ? common() : _.extend(common(), {
			data: [{
				series: generate(vm().FN.N())
			},
			{
			series: [{x: Math.floor(vm().FN.where()), y: Math.sin(Math.floor(vm().FN.where()))}]
			}],
			graphProps: [
			{
				onlyMarks: true,
				markSize: 1,
				shader: {
					type: 'color',
					computation: 'explicit',
					options: {
						colors: ['#FFFFFF','#3A83F1']
					},
					factor: _.map(generate(vm().FN.N()), (p) => {return Math.abs(p.y);})
				}
			},
			{
				onlyMarks: true,
				color: 'red',
				markSize: 3
			}]
		});
		let FN = grapher.init(data);
		return FN.props();
	};
	let updateGraphFN = (get) => get().curves[1].marks[0].position.pivot()
		.set('x',vm().FN.where())
		.set('y',Math.sin(vm().FN.where()));

	// freezer, foreground
	let graphFF = (init) => {
		let data = init ? common() : _.extend(common(), {
			data: [{
				series: generate(vm().FF.N())
			}],
			graphProps: [
			{
				onlyMarks: true,
				markSize: 1,
				shader: {
					type: 'color',
					computation: 'explicit',
					options: {
						colors: ['#FFFFFF','#3A83F1']
					},
					factor: _.map(generate(vm().FF.N()), (p) => {return Math.abs(p.y);})
				}
			}],
			foreground: {
				x: vm().FF.where(),
				y: Math.sin(vm().FF.where()),
				content: () => React.createElement('circle',{r: 3, fill: 'red', cx: 0, cy: 0})
			}
		});
		let FF = grapher.init(data);
		return FF.props();
	};
	let updateGraphFF = (get) => {
		let v = get();
		return v.foreground.pivot()
			.set('x',vm().FF.where())
			.set('y',Math.sin(vm().FF.where()));
	};

	return {
		RN: oneGraphVM.create(() => vm().RN, {makeGraph: graphRN, Nstart: 100, height: 225, updateGraph: updateGraphRN}),
		RNP: {
			body: 'All is recomputed',
			title: 'Details'
		},
		RF: oneGraphVM.create(() => vm().RF, {makeGraph: graphRF, Nstart: 100, height: 225, updateGraph: updateGraphRF}),
		RFP: {
			body: 'All is recomputed',
			title: 'Details'
		},
		FN: oneGraphVM.create(() => vm().FN, {makeGraph: graphFN, Nstart: 100, height: 225, updateGraph: updateGraphFN}),
		FNP: {
			__html: "mgr().props.curves[1].marks[0].position.pivot()</br>.set('x',vm().FN.where())</br>.set('y',Math.sin(vm().FN.where()))",
			title: 'Details'
		},
		FF: oneGraphVM.create(() => vm().FF, {makeGraph: graphFF, Nstart: 100, height: 225, updateGraph: updateGraphFF}),
		FFP: {
			__html: "mgr().props.foreground.pivot()</br>.set('x',vm().FF.where())</br>.set('y',Math.sin(vm().FF.where()))",
			title: "Details"
		}
	};
};

module.exports = m;
