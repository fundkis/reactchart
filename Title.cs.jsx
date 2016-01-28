var React = require('react');

var Title = React.createClass({
	render: function(){
		var title = this.props.title;
		var titleFSize = this.props.titleFSize;
		var xT = this.props.width / 2;
		var yT = titleFSize + 5; // see defaults in space-mgr, its 10 px margin
		return (!!title && title.length !== 0)? <text textAnchor='middle' fontSize={titleFSize} x={xT} y={yT}>{title}</text>:null;
	}
});

module.exports = Title;
