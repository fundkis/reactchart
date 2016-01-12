# Bibliothèque de graphiques de FundKIS

Cette bibliothèque est développée par 
[FundKIS](http://fundkis.com) dans le
but de créer des graphiques de qualités
spécialisés pour la finance. Elle est construite
dans l'idée de futures extensions, les structures
utilisée (voir section [Les propriétés](https://github.com/fk-hb/fk-js/tree/develop/src/fkdb/server/src/svg#les-proprietes))

## Dépendances

Cette bibliothèque est basée sur la 
bibliothèque [React](http://facebook.github.io/react/)
de facebook.

## Utilisation

L'objet **React** à utiliser est l'object **Graph**,
l'utilisation la plus simple étant de l'encapsuler
dans un objet **React** :

```
var React = require('React');
var Graph = require('path/to/library/Graph.cs.js');

React.createClass({
... code ...
  render: function(){

    var graphProprieties;

    ... code to fill appropriately graphProprieties ...

    return <Graph {...graphProprieties} />;
  }

});

```

### Les propriétés

À l'exception des marques, toutes les propriétés
sont listées dans le fichier _core/proprieties.cs.js_.

Les propriétés sont à comprendre en terme de trois différentes
catégories :
- les données d'un graphique ;
- le style d'un graphique ;
- les axes.

#### Les données d'un graphique

```
data: [{
	serie: [
		{
			x: Date || Number || String, 
			y: Date || Number || String
		}
	],
	abs: {
		type: String,
		axis: String
	},
	ord: {
		type: String,
		axis: String
	},
	stacked: Boolean
}]
```

Les données comprennent un ensemble de points ```[{x, y}]```
ainsi que quelques indications structurantes, comme les axes
sur lesquels sont projetés ces points (objects ```abs``` et 
```ord```). Les valeurs peuvent être des nombres, des dates
(l'object javascript **Date**) ou un label.

Les objects ```abs``` et ```ord``` codent pour, respectivement,
l'abscisse et l'ordonnée du graphique. Le ```type``` est soit
_number_ soit _date_, un label sera remplacé automatiquement par
son index, soit un nombre. Le placement des axes est _top_ ou 
_bottom_ pour une abscisse et _left_ ou _right_ pour une
ordonnée.

##### Résumé

Clé      | Valeurs possibles  | Défaut
---------|------------------- | 
abs.type | _number_ ou _date_ | **number**
abs.axis | _bottom_ ou _top_  | **bottom**
ord.type | _number_ ou _date_ | **number**
ord.axis | _left_ ou _right_  | **left**
stacked  | _true_, _false_    | **undefined** (équivalent _false_)

#### Les styles d'un graphique

```
	graphProps: [{
		color: String,
		width: Number,
		fill: Number || 'none',
		mark: Boolean,
		markColor: String,
		markSize: Number,
		markType: String,
		onlyMarks: Boolean,
		shader: undefined, 
		process: undefined 
	}]
```

Un graphique se caractérise par une couleur (```color```),
une épaisseur de trait (```width```) ainsi que des
marques. Il est possible d'avoir une couleur différente
pour les marques (```markColor```), de n'afficher que
celles-ci (```onlyMarks```) et de déterminer leur
taille (```markSize```). Chaque marque peut aussi
avoir une description plus fine spécifique, auquel
cas un objet ```markProps``` contenant
cette définition sera ajouté au propriétés
(voir la section sur les [marques](https://github.com/fk-hb/fk-js/tree/develop/src/fkdb/server/src/svg#les-differents-type-de-marques))

Clés      | Valeurs possibles  | Défaut
----      | ------------------ |  -----
color     | toute couleur html | noir
width     | tout nombre        | **1**
fill      | toute couleur html ou _'none'_ | **'none'**
mark      | _true_ ou _false_  | _false_
markColor | toute couleur htlm | **undefined** (équivalent ```color```)
markSize  | tout nombre        | **3**
markType  | _'dot'_ ou _'bar'_ | **'dot'**
onlyMarks | _true_ ou _false_  | **false**
shader    | objet [_shader_](https://github.com/fk-hb/fk-js/tree/develop/src/fkdb/server/src/svg#shader)  | **undefined**
process   | objet [_process_](https://github.com/fk-hb/fk-js/tree/develop/src/fkdb/server/src/svg#shader) | **undefined**

##### Shader

```
shader: {
	type: String,
	computation: String,
	factor: [Number],
	options: {
		colors: [String]
	}
}
```

##### Process

```
process: {
	type: String,
	dir: String
}
```

## Les différents type de graphiques

* Graphique simple (**Plain**)
* Histogramme (**Stairs**)
* Barres (**Bars**)

## Les différents type de marques

* Des disques (**dot**)
* Des rectangles (**bar**)
