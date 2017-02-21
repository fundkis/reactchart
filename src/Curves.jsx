let React = require('react');
let _ = require('underscore');
let grapher = require('./graphs/grapher.jsx');
let imUtils = require('./core/im-utils.js');

/*
	{
		curves: [{
			key: '', 
			points: [{}],
			props: {
			}
		}]
	}
*/

class Curves extends React.Component {
	
	shouldComponentUpdate(props){
		return !imUtils.isEqual(props.state,this.props.state);
	}

	render(){
		return <g>{_.map(this.props.state, (curve) => {return grapher(curve.type,curve);})}</g>;
	}

}

module.exports = Curves;
