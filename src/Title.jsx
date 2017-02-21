let React = require('react');

let imUtils = require('./core/im-utils.js');

class Title extends React.Component {

	shouldComponentUpdate(props){
		return !imUtils.isEqual(props.state,this.props.state);
	}

	render(){
		let xT = this.props.state.width / 2;
		let yT = this.props.state.FSize + 5; // see defaults in space-mgr, its 10 px margin
		return (!!this.props.state.title && this.props.state.title.length !== 0) ? <text textAnchor='middle' fontSize={this.props.state.FSize} x={xT} y={yT}>{this.props.state.title}</text>:null;
	}
}

module.exports = Title;
