let React = require('react');
let Show	= require('./Show.jsx');
let Graph = require('../src/Graph.jsx');

let _ = require('underscore');

//let ReactDOMServer = require('react-dom/server');
//let file = "data:text/svg;charset=UTF-8," + encodeURIComponent(ReactDOMServer.renderToString(<Graph {...props}/>));

let printStr = (state,key) => <div className='col-md-6'>
		<Show state={state[key + 'P']}>
			<Graph {...state[key]}/>
		</Show>
	</div>;

let printObj = (state,key) => <div className='col-md-6'>
    {key.extra}
		<Show state={state[key.graph + 'P']}>
			<Graph {...state[key.graph]}/>
		</Show>
	</div>;

let print = (state,key) => (typeof key === 'string' ? printStr : printObj)(state,key);

let line = (state,key1,key2) => <div className='row' key={key1}>
  {print(state,key1)}
	{!!key2 ? <div className='col-md-6'>
		<Show state={state[key2 + 'P']}>
			<Graph {...state[key2]}/>
		</Show>
	</div> : null}
</div>;

module.exports = {

	render: (state) => <div>
    <h2>Static charts</h2>
			{_.map([
				['plainD','plain'],
				['fill','fill2'],
				['plainOM','plainOMS'],
				['stack','tag'],
				['histo','mHisto']
			],(k) => line(state,k[0],k[1]))}
			<div className='row'>
				<div className='col-md-6'>
					<Show state={state.pieP}>
						<div className='clearfix'>
							<div className='col-md-2'>
								<Graph.Legend {...state.pie}/>
							</div>
							<div className='col-md-10'>
								<Graph {...state.pie}/>
							</div>
						</div>
					</Show>
				</div>
				<div className='col-md-6'>
					<Show state={state.toreP}>
						<div className='text-center'>
							<Graph {...state.tore}/>
							<Graph.Legend line {...state.tore}/>
						</div>
					</Show>
				</div>
			</div>
    <h2>Dynamic charts</h2>
      {line(state,{graph: 'dyn', extra: <button className='btn btn-primary' onClick={() => state.dynLaunch()}>Animate</button>})}
	</div>
};
