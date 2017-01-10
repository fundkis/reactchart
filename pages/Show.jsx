let React = require('react');

let uuid = require('node-uuid');

class Show extends React.Component {

	render(){
		let state = this.props.state;
		let id = uuid.v4();
		let html = {
			__html: state.__html
		};
		let body = state.body;
		return <div>
			{this.props.children}
			<div className='panel panel-default'>
				<div className='panel-heading'>
					<button className='btn btn-link' type='button' data-toggle='collapse' data-target={'#' + id}>{state.title}</button>
				</div>
				<div className='panel-collapse collapse out' id={id}>
					{ !!html.__html ? <div className='panel-body' dangerouslySetInnerHTML={html}/> :
						<div className='panel-body'>{body}</div>}
				</div>
			</div>
		</div>;
	}

}

module.exports = Show;
