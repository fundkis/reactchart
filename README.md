# FundKIS' immutable React-based graphics library

This is a work of [FundKIS](http://fundkis.com) 
to easily produce quality graphics specialized in
finance.

Those graphics are produce in the [SVG](https://www.w3.org/Graphics/SVG/)
format.

## Dependencies

It's based on [React](http://facebook.github.io/react/)
and [Freezer](https://github.com/arqex/freezer).

## Usage

Let's start with a minimal example:

```
let React = require('react');
let Graph = require('fk-graph');

let props = {
	width: 600, // px
    height: 300, // px
    data: [{
    	series: [{x: 0, y: 1},{x: 1, y: 2}]
    }],
    graphProps: [{color: 'blue'}]
};

class ShowGraph extends React.Component {

	render(){
    	return <div>
        	<h1>My first graph!</h2>
            <Graph {...props}/>
        </div>;
    }
}

```

All the subtlety consists in knowing the props.

### Proprieties you should know about

The very least you need to do is to provide a _width_, a _height_,
some _data_ and _graphProps_. The data you wish to render
are the _series_ in the _data_ part, while the way you
wish to see them will be in the _graphProps_ part.

#### The _data_

The _data_ proprieties contains the numerical description of the
graphic, basically what should be shown. It is an array as one
graphic may contain several data.

```
data: [{
	series: [{x, y, value, label: {x, y}, tag}], // the data points
    type: 'Plain' or 'Bars' or ..., // type of graph
    stacked: undefined or x or y, // should the data be stacked along a direction
    coordSys: 'cart', // coordinate system,
    ord: {
    	axis: 'left' or 'right', // which axis
        type: 'number' or 'date' // type of y data
    },
    ord: {
		axis: 'bottom' or 'top',
        type: 'number' or 'date'
	}
}, ...
]
```

The first piece of information to provide is the data points. The simplest
form is ```{x, y}``` with the values being either a number or a date. In the case
of preprocessing (see [histogram](https://github.com/fk-dev/fk-graph/#Histograms))
the _value_ proprieties provide the values we want to preprocess. The _label_ enables
to print labels instead of values at the axis' corresponding tick.

It is possible to stack values, it means that the current graphic should be on top
of the previous stacked graphics. It is only working point-wise.

The library can handle numbers and dates as input values, a date should be explicitely
declared in the correspondig proprieties (_abs_ if in abscissa or _ord_ if ordinate).

#### The _graphProps_

This contains the description of how the data should be printed. When there are
several values, the first value given is the default value.

Note that in most browser, an **undefined** color is equivalent to black.

```
graphProps: [{
	color: 'black' or 'blue' or '#1F456C' or ..., // any color
	width: 1, // any number
	fill: 'none' or 'blue' or ..., // any color or 'none'
	shade: 1, // any number between 0 and 1
    dropLine: {x: false or true, y:false or true}, // draw?
	// mark props, explicit at this level
	// overwritten if present in markProps
	// exists for friendlyness of use
	mark: true or false, // print marks ?
	markColor: undefined, // any color
	markSize: 3, // 
	markType: 'dot', //
	onlyMarks: false, //
	// contains low-level description,
	// i.e. specific things like radius
	// for a dot, or anything.
	markProps: {},
	shader: undefined, // playing with colors
	process: undefined, // playing with data {dir: x || y, type: 'histogram'}
	tag: {
		show: false, // show the tag
		print: (t) => t + '', // if something special needs to be done
		fontSize: 10, // any number
		pin: true or false, // show the pin
        pinColor: 'black', 
		pinLength: 10, // 10 px as pin length by default
		pinAngle: 90, // direction fo pin
        pinHook: 3
	}
}, ...
]
```

The details of the _marksProps_ are given at the [marks](https://github.com/fundkis/reactchart/#The different marks) section, the _shader_ at the [shading](https://github.com/fundkis/reactchart/#Playing with color) section.

##### Basic

The basic proprieties are the color (_color_), the width of the line (_width_), the opacity of
the graphic (_shade_) and wether or not the area under the curve should be colored (_fill_). Please
note that the aera filled is the one corresponding to the area between the values and the
drop values, which by default are 0. This is the mathematical definition of the integral.

##### dropLine

The _dropLine_ boolean is used to print the drop lines (usefull mostly for histograms).

##### The marks controller at high level

A few mark controllers are available at this level of description. The most common ones:
  - should the mark be printed? _mark_;
  - the color of the marks: _markColor_;
  - the type of mark: _markType_;
  - the size of the marks: _markSize_.

The different types available are currently _dot_, _square_ and _bar_.
Note that the size has a different meaning for different marks. For more details, see the
[description of the marks](https://github.com/fundis/reactchart/#The different marks).

##### shader

The _shader_ enables fine color control of the marks, it has three calculations type, see
the [shading section](https://github.com/fundkis/reactchart/#Playing with color).

##### Preprocess the data

the _process_ propriety enables to give the library values we want to display with some
type of processing. As of now, only histograms are available.

```
process: {
	dir: undefined || x || y, 
    type: undefined || 'histogram'
}
```

The type of preprocessing must be explicit. If the proprieties _value_ exists in the
data, it has predominance over any other defined propriety.  If no _value_ is defined,
a direction should be given, to define which, of the _(x,y)_ characteristics, should be
computed.

It is possible to defined several histograms for one serie. In this case, say we want to
represent an histogram of the daily expenses every month. In that case the data should
be formatted as follow: the _x_ (or _y_) should contains the date of the targeted month,
_y_ (resp. _x_) the value of the expense. The direction given is _y_ (resp. _y_). Thus we have _N_ values for every month, the library will compute the optimized histogram according to 
[Knuth](http://knuthlab.rit.albany.edu/papers/knuth-histo-public.pdf) for every month.
The library will compute every histogram and define the point so that an _onlyMarks_ _bar_-mark
graphic would render an histogram as seen from above.


##### Tag the data

You can tag any data point you wish. Note that tagging is a 
[complex issue](https://en.wikipedia.org/wiki/Automatic_label_placement), and it is not
in the [FundKIS](https://fundkis.com/) TODO list to start research in this area. Thus
labelling is kept at it's most basic form: you describe a tag (called pin) with its
length, angle, and hook. The tag itself is given by a _tag_ propriety in the data point.

#### The axis' description: _axisProps_

### The different graphics' type
#### Plain
#### Bars
#### Stairs
#### Pie
### The different marks
#### Dot
#### Square
#### Bar
### Playing with the colors
### Some more playabilities (background, foreground, preprocess)
#### Histograms
### Immutability and optimisation


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
