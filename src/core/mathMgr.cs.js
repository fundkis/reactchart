/////////////////////
/// misc
///////////////////

var relEps = 1e-16;

var misc = {};

// a < b
misc.lowerThan = function(a,b){
	return (a - b) < - relEps;
};

// a < b
misc.greaterThan = function(a,b){
	return (a - b) > relEps;
};

// a <= b
misc.lowerEqualThan = function(a,b){
	return (a - b) < relEps;
};

// a <= b
misc.greaterEqualThan = function(a,b){
	return (a - b) > - relEps;
};

// a === b
misc.equalTo = function(a,b,coef){
	coef = coef || 1;
	return Math.abs(a-b) < coef * relEps;
};

// a !== b
misc.notEqualTo = function(a,b,coef){
	coef = coef || 1;
	return Math.abs(a-b) > coef * relEps;
};

misc.isZero = function(a,coef){
	coef = coef || 1;
	return Math.abs(a) < coef * relEps;
};

////////////////////////////
//// histogram
///////////////////
var gamm = require('gamma');

/*
  Optimal binned 1-D histogram from 
  ``Optimal Data-Based Binning for Histograms'', Kevin H. Knuth
  knuthlab.rit.albany.edu/index.php/Products/Paper (paper of 2006)


  The idea is to compute the log entropy and to find the max.
  It implies that the binning adds the minimum amount of information
  with respect to the sample.

  ** sample of $N$ values
  ** $m$ is the number of bins
  ** $c_i$ is the number of values in bin $i$

  For a sample $\{x\}$ of values, we note $\max_x$ the maximum value of
  the sample, $\min_x$ the minimum. $x_i$ denotes all the values contained
  in bin $i$. We have:
  \[
     P(X \in x_i) = \frac{m}{\max_x - \min_x}  \frac{c_i + \frac{1}{2}}{N + \frac{m}{2}}
  \]
  \[
     \Delta P(X \in x_i) = \frac{m}{\max_x - \min_x} \sqrt{\frac{ (c_i + \frac{1}{2}) ( N - c_i + \frac{m - 1}{2} )}
                                                                { ( N + \frac{m}{2} + 1) (N + \frac{m}{2})^2 }
                                                          }
  \]

  The natural logarithm of the entropy of the histogram is given by:
  \[
     \ln(S) = N  \ln(m) + \ln\left(\Gamma(\frac{m}{2})\right) - \ln\left(\Gamma(N + \frac{m}{2})\right) - m \ln\left(\Gamma(\frac{1}{2})\right)
              + \sum_{i = 1}^m \ln\left(\Gamma(c_i + \frac{1}{2})\right) 
  \]


  À comparer avec le code actuel, côté client:
   fkdb/public/risk/riskHistograms.js
*/

var histo = {};

histo.opt_histo = function(echant){ // return optimal binned histo between 5 and 100 bins

	var opt_hist = [];

	if(!echant || echant.length === 0){

		opt_hist.push({
			bin: 0,
			db: 0,
			prob: 0,
			dprob: 0,
			count: 0
		});

	}else{

		// local variables
		var log_entropy;
		var count_opt;
		var min = Math.min.apply(null,echant);
		var max = Math.max.apply(null,echant);
		var v = max - min;

		// Dirac
		if(misc.isZero(v)){

			opt_hist.push({
				bin: min,
				db: 0,
				prob: 1,
				dprob: 0,
				count: echant.length
			});

		}else{
			// the histogram algorithm
			var hist =  function(sample,nBin){ // nBin is an integer
				var dx = (max-min)/nBin;

				var histo_count = [];

				for(var i = 0; i < nBin; i++){// setting the bins
					histo_count.push({
						bin: min + i * dx,
						count: 0
					});
				}

				for(i = 0; i < sample.length; i++){ //populating the bins
					var k = Math.min(Math.floor((sample[i] - min)/dx), nBin - 1);
					histo_count[k].count++;
				}

				return histo_count;
			};


			// the scan
			for(var bin = 5; bin < 101; bin++){// 5 - 100 scan
				var h = hist(echant,bin);

				var val= echant.length * Math.log(bin) + gamm.log(bin * 0.5) - gamm.log(echant.length + bin * 0.5) - bin * gamm.log(0.5);
				for(var i = 0; i < bin; i++){
					val += gamm.log(h[i].count + 0.5);
				} 
				if(!log_entropy || log_entropy < val){
					count_opt = h;
					log_entropy = val;
				}
			}

			// between 5 and 100, 0 and 1 necessarily exists
			var dx = count_opt[1].bin - count_opt[0].bin;
		// the final output
			for(var j = 0; j < count_opt.length; j++){
				opt_hist.push({
					bin: count_opt[j].bin,
					db: dx,
					prob: count_opt.length / v * (count_opt[j].count + 0.5) / (echant.length + count_opt.length * 0.5),
					dprob: count_opt.length / v * Math.sqrt(  (count_opt[j].count + 0.5) *
						(echant.length - count_opt[j].count + (count_opt.length - 1) * 0.5 ) /
						(echant.length + count_opt.length * 0.5 + 1) /
						( (echant.length + count_opt.length *0.5 ) * (echant.length + count_opt.length * 0.5) )
						),
					count: count_opt[j].count
				});

			}
		}
	}

	return opt_hist;

};


var m = {};

m.histo = histo;
m.misc = misc;

module.exports = m;
