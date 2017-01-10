let React = require('react');
let Show	= require('./Show.jsx');
let Graph = require('../src/Graph.jsx');

let _ = require('underscore');

//let ReactDOMServer = require('react-dom/server');
//let file = "data:text/svg;charset=UTF-8," + encodeURIComponent(ReactDOMServer.renderToString(<Graph {...props}/>));

let line = (state,key1,key2) => <div className='row' key={key1}>
	<div className='col-md-6'>
		<Show state={state[key1 + 'P']}>
			<Graph {...state[key1]}/>
		</Show>
	</div>
	<div className='col-md-6'>
		<Show state={state[key2 + 'P']}>
			<Graph {...state[key2]}/>
		</Show>
	</div>
</div>;

module.exports = {

	render: (state) => <div>
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
	</div>
};
