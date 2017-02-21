let m = {};

m.VM = function(position,props,ds,key,pin,open){

	let draw = props.markProps.draw || position.draw || false;
	let color = position.color || props.markProps.color || props.markColor || props.color || 'black';
	let width = position.width || props.markProps.width || draw ? 1 : 0;
	let fill = open ? 'none' : position.fill || props.markProps.fill || color;
	let size = position.size || props.markProps.size || props.markSize || 3;
	let shade = position.shade || props.markProps.shade || 1;

	return {
		key: key,
		draw: draw,
		ds: ds,
		position:{
			x: position.x,
			y: position.y
		},
		color: color,
		width: width,
		fill: fill,
		size: size,
		shade: shade,
		pin: pin
	};

};


m.OVM = function(position,props,ds,key,pin){
	props.markProps.draw = true;
	return m.VM(position,props,ds,key,pin,true);
};

module.exports = m;
