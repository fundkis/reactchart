let m = {};
m.unidev_01 = Math.random;

let unidev_1 = () => {
  let out = m.unidev_01();
  return !out ? unidev_1() : out;
};


m.BoxMuller = function(n,s){
  let rsq = 2;
	let v1;
	while( !(0 < rsq && rsq < 1) ){
		v1 = 2 * m.unidev_01() - 1;
		let v2 = 2 * m.unidev_01() - 1;
		rsq = v1 * v1 + v2 * v2;
	}
	let fac = s * Math.sqrt( -2 * Math.log(rsq)/rsq);
	return v1 * fac + n;
};

m.Marsaglia = function(k,t){
	if(k < 1){
		return m.Marsaglia(1 + k, t) * Math.pow(unidev_1(), 1/k);
	}

	var d = k - 1 / 3;
	var c = (1 / 3) / Math.sqrt(d);

	var testux = (x) => 1 - 0.0331 * x * x * x * x;
	var testvx = (x,v) => 0.5 * x * x + d * (1 - v + Math.log (v));
	var ok = (x,u,v) =>  u < testux(x) || Math.log(u) < testvx(x,v);

	var x,u,v;
	do{

		do{
			x = m.BoxMuller(0,1);
			v = 1 + c * x;
		}while( v <= 0);

		v = v * v * v;
		u = unidev_1();

	}while(!ok(x,u,v));


	return t * d * v;
};

m.directBeta = function(s1,s2){
	var x = m.Marsaglia(s1,1);
	var y = m.Marsaglia(s2,1);
	return x / (x + y);
};

module.exports = m;
