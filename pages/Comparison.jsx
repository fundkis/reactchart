let React = require('react');

let { FKComponent } = require('fk-react-base');

let OneGraph = require('./OneGraph.jsx');
let Show = require('./Show.jsx');

class Comparison extends FKComponent {

	render(){
		let state = this.props.state;
		return	<div>
			Il existe deux façons de produire un graphique&nbsp;:
			<ul>
				<li><i>human-friendly</i>, les données sont passées dans un format
					plus simple à lire pour un humain, la machine calcule toutes les
					données nécessaires pour produire le graphique&nbsp;;</li>
				<li>efficace, les données sont directement passées sous une forme
					machine, toute modification sous cette forme n'entraînera aucun
					calcul, et seule la partie modifiée sera redessinée.</li>
			</ul>
				On compare ici les performances pour redessiner un graphique sur lequel
				un des points est mis en évidence, en étant rouge et aggrandi. À gauche,
				il s'agit d'une courbe supplémentaire ajoutée avec pour seul point
				le point visé, à droite, il est placé sur le <i>foreground</i>.
			<h2><i>human-friendly</i></h2>
			<p>
				Tout étant recalculé, la mise à jour du graphique s'essoufle
				rapidement. 1&thinsp;000 points et ça rame, quel que soit la
				méthode du point rouge.
			</p>
			<div className='row'>
				<div className='col-md-6'>
					<Show state={state.RNP}>
						<OneGraph state={state.RN}/>
					</Show>
				</div>
				<div className='col-md-6'>
					<Show state={state.RFP}>
						<OneGraph state={state.RF}/>
					</Show>
				</div>
			</div>
			<h2>En passant par Freezer</h2>
			<p>
				Seul le point est recalculé. Les deux méthodes offrent sensiblement
				les même performances. Il faut monter à un bon 50&thinsp;000 points
				pour voir les effets d'accumulation.
			</p>
			<div className='row'>
				<div className='col-md-6'>
					<Show state={state.FNP}>
						<OneGraph state={state.FN}/>
					</Show>
				</div>
				<div className='col-md-6'>
					<Show state={state.FFP}>
						<OneGraph state={state.FF}/>
					</Show>
				</div>
			</div>
		</div>;
	}

}

module.exports = Comparison;
