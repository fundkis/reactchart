var m = {};

m.VM = function(position,props,ds,key){

	var draw = props.markProps.draw || position.draw || false;
	var color = position.color || props.markProps.color || props.markColor || props.color || 'black';
	var width = position.width || props.markProps.width || draw ? 1 : 0;
	var fill = position.fill || props.markProps.fill || color;
	var size = position.size || props.markProps.size || props.markSize || 3;
	var radius = position.radius || props.markProps.radius || size;
	var shade = position.shade || props.markProps.shade || 1;

	return {
		key: key,
		draw: draw,
		ds: ds,
		position: {
			x: position.x,
			y: position.y
		},
		radius: radius,
		color: color,
		width: width,
		fill: fill,
		size: size,
		shade: shade
	};

};

module.exports = m;
