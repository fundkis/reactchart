let { binding, sliderVM } = require('fk-react-base');
let { defInputVM } = binding;

let m = {};

m.create = function(get, { tag, makeGraph, height, Nstart, updateGraph }){

	let vm = get;

	let launch = () => {
		vm().points.edit(Nstart);
		vm().set('graph',makeGraph());
	};

	let reslide = (N) => vm().pivot()
		.set('slide',sliderVM.create(() => vm().slide, {min: 0, max: N, height, init: vm().slide.model(), onChange: () => updateGraph(() => vm().graph) }))
		.set('graph',makeGraph());

	return {
		launch: launch,
		points: defInputVM.create(() => vm().points, {onChange: reslide}),
		slide:  sliderVM.create(() => vm().slide, {min: 0, max: Nstart, height, init: Nstart/2, onChange: () => updateGraph(() => vm().graph) }),
		graph:  makeGraph(true),
		N:      () => vm().points.model(),
		where:  () => vm().slide.model(),
	};

};

module.exports = m;
