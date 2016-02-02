var React = require('react');
var Drawer = require('./Drawer.cs.jsx');

var core = require('./core/process.cs.js');

var Graph = React.createClass({

	render: function(){

		var props = this.props.preprocessed === true ? this.props : core.process(this.props) ;

		return <Drawer {...props} />;
	}
});

module.exports = Graph;
