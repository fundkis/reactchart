let React = require('react');
let Show	= require('./Show.jsx');
let Graph = require('../src/Graph.jsx');

let printStr = (state,key,c) => <div className={'col-md-' + c} key={key + 'i'}>
		<Show state={state[key + 'P']}>
			<Graph {...state[key]}/>
		</Show>
	</div>;

let printObjGraph = (state,key,c) => <div className={'col-md-' + c} key={key.graph + 'i'}>
    {key.extra}
		<Show state={state[key.graph + 'P']}>
			<Graph {...state[key.graph]}/>
		</Show>
	</div>;

let printObjPlain = (state,key,c) => <div className={'col-md-' + c} key={key.key}>
		{key.obj}
	</div>;

let printObj = (state,key,c) => (!!key.graph ? printObjGraph : printObjPlain)(state,key,c);

let print = (state,key,c) => (typeof key === 'string' ? printStr : printObj)(state,key,c);

let loop = (state,keys) => {
	let out = [];
	let c = Math.min(Math.floor(12/keys.length),6);
	for(let k = 0; k < keys.length; k++){
		out.push(print(state,keys[k],c));
	}
	return out;
};

let line = (state,keys) => <div className='row' key={!!keys[0].graph ? keys[0].graph : keys[0]}>
 	{loop(state,keys)}
</div>;

module.exports = line;
