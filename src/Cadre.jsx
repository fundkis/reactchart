let React = require('react');
let imUtils = require('./core/im-utils.js');

class Cadre extends React.Component {

	shouldComponentUpdate(props){
		return !imUtils.isEqual(props.cadre,this.props.cadre);
	}

	render(){
		return <rect width={this.props.width} height={this.props.height} strokeWidth='1' stroke='black' fill='none' x='0' y='0'/>;
	}
}

module.exports = Cadre;
