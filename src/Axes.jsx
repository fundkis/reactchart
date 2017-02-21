let React = require('react');
let Axe = require('./axis/Axe.jsx');
let imUtils = require('./core/im-utils.js');
let _ = require('underscore');

/*
	{
		abs: [Axe],
		ord: [Axe]
	}
*/

class Axes extends React.Component {

	shouldComponentUpdate(props){
		return !imUtils.isEqual(props.state,this.props.state);
	}

	abscissa(){
		let css = this.props.state.css;
		return _.map(this.props.state.abs, (p) => {return p.show ? <Axe className='xAxis' key={p.key} css={css} state={p}/> : null;});
	}

	ordinate(){
		let css = this.props.state.css;
		return _.map(this.props.state.ord, (p) => {return p.show ? <Axe className='yAxis' key={p.key} css={css} state={p}/> : null;});
	}

	render(){

		return <g>
				{this.abscissa()}
				{this.ordinate()}
			</g>;
	}

}

module.exports = Axes;
