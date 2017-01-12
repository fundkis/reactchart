let React = require('react');

class Slide extends React.Component {

	componentWillMount(){
		this.state = {n: 5000, nMax: 10000, ok: false, start: null};
	}

	ticks(){
		let out = [];
		for(let i = 0; i < 11; i++){
			let u = i*40;
      let yl = i === 0 ? u + 0.5 : i === 10 ? u - 0.5 : u;
      let yt = i === 0 ? u + 10 : i === 10 ? u : u + 5;
			out.push(<line x1={25} x2={15} y1={yl} y2={yl} stroke='black' strokeWidth='1' key={'t.' + i}/>);
			out.push(<text x={30} y ={yt} anchor='left' key={'l.' + i}>{i / 10}</text>);
		}
		return out;
	}

	drag(e){
		if(!this.state.ok){return;}
		let go = e.clientY - this.state.start;
		let nv = Math.floor(this.state.n + go / 400 * this.state.nMax);
		this.props.onChange(nv);
		this.setState({n: nv, start: e.clientY});
	}

	render(){
		let y = this.state.n / this.state.nMax;
		y *= 400;
		return <svg width='60' height='400'
				onMouseDown={(e) => this.setState({ok: true, start: e.clientY})}
				onMouseMove={(e) => this.drag(e)}
				onMouseUp={() => this.setState({ok: false})} 
				onBlur={() => this.setState({ok: false})}
				onMouseLeave={() => this.setState({ok: false})}>
    <defs>
    <linearGradient id="colorBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#8884d8" stopOpacity={0}/>
      <stop offset="50%" stopColor="#8884d8" stopOpacity={0.5}/>
      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
    </linearGradient>
  </defs>
      <rect x={0} y={0} width={60} height={400} fill='url(#colorBg)'/>
			<line x1={20} y1={0} x2={20} y2={400} stroke='black' strokeWidth='1'/>
			{this.ticks()}
			<circle cx={5} cy={y} r={4} fill='red'/>
		</svg>;
	}

}

module.exports = Slide;
