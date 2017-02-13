/* 2017- generated at Tue Feb 14 2017 00:23:37 GMT+0100 (CET)
*/(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Freezer = require(3);
module.exports = Freezer;
},{"3":3}],2:[function(require,module,exports){
'use strict';

var Utils = require(6);



//#build


var BEFOREALL = 'beforeAll',
	AFTERALL = 'afterAll'
;
var specialEvents = ['immediate', BEFOREALL, AFTERALL];

// The prototype methods are stored in a different object
// and applied as non enumerable properties later
var emitterProto = {
	on: function( eventName, listener, once ){
		var listeners = this._events[ eventName ] || [];

		listeners.push({ callback: listener, once: once});
		this._events[ eventName ] =  listeners;

		return this;
	},

	once: function( eventName, listener ){
		return this.on( eventName, listener, true );
	},

	off: function( eventName, listener ){
		if( typeof eventName == 'undefined' ){
			this._events = {};
		}
		else if( typeof listener == 'undefined' ) {
			this._events[ eventName ] = [];
		}
		else {
			var listeners = this._events[ eventName ] || [],
				i
			;

			for (i = listeners.length - 1; i >= 0; i--) {
				if( listeners[i].callback === listener )
					listeners.splice( i, 1 );
			}
		}

		return this;
	},

	trigger: function( eventName ){
		var args = [].slice.call( arguments, 1 ),
			listeners = this._events[ eventName ] || [],
			onceListeners = [],
			special = specialEvents.indexOf( eventName ) != -1,
			i, listener
		;

		special || this.trigger.apply( this, [BEFOREALL, eventName].concat( args ) );

		// Call listeners
		for (i = 0; i < listeners.length; i++) {
			listener = listeners[i];

			if( listener.callback )
				listener.callback.apply( this, args );
			else {
				// If there is not a callback, remove!
				listener.once = true;
			}

			if( listener.once )
				onceListeners.push( i );
		}

		// Remove listeners marked as once
		for( i = onceListeners.length - 1; i >= 0; i-- ){
			listeners.splice( onceListeners[i], 1 );
		}

		special || this.trigger.apply( this, [AFTERALL, eventName].concat( args ) );

		return this;
	}
};

// Methods are not enumerable so, when the stores are
// extended with the emitter, they can be iterated as
// hashmaps
var Emitter = Utils.createNonEnumerable( emitterProto );
//#build

module.exports = Emitter;

},{"6":6}],3:[function(require,module,exports){
'use strict';

var Utils = require(6),
	Emitter = require(2),
	Mixins = require(5),
	Frozen = require(4)
;

//#build
var Freezer = function( initialValue, options ) {
	var me = this,
		mutable = ( options && options.mutable ) || false,
		live = ( options && options.live ) || live
	;

	// Immutable data
	var frozen;
	var pivotTriggers = [], pivotTicking = 0;
	var triggerNow = function( node ){
		var _ = node.__,
			i
		;
		if( _.listener ){
			Frozen.trigger( node, 'update', 0, true );

			if( !_.parents.length )
				_.listener.trigger('immediate', 'now');
		}

		for (i = 0; i < _.parents.length; i++) {
			notify('now', _.parents[i]);
		}
	};
	var addToPivotTriggers = function( node ){
		pivotTriggers.push( node );
		if( !pivotTicking ){
			pivotTicking = 1;
			Utils.nextTick( function(){
				pivotTriggers = [];
				pivotTicking = 0;
			});
		}
	}
	var notify = function notify( eventName, node, options ){
		var _ = node.__,
			nowNode
		;

		if( eventName == 'listener' )
			return Frozen.createListener( node );

		if( eventName == 'now' ){
			if( pivotTriggers.length ){
				while( pivotTriggers.length ){
					nowNode = pivotTriggers.shift();
					triggerNow( nowNode );
				}
			}
			else {
				triggerNow( node );
			}
			return node;
		}

		var update = Frozen.update( eventName, node, options );

		if( eventName != 'pivot' ){
			var pivot = Utils.findPivot( update );
			if( pivot ) {
				addToPivotTriggers( update );
	  			return pivot;
			}
		}

		return update;
	};

	var freeze = function(){};
	if( !mutable )
		freeze = function( obj ){ Object.freeze( obj ); };

	// Create the frozen object
	frozen = Frozen.freeze( initialValue, notify, freeze, live );

	// Listen to its changes immediately
	var listener = frozen.getListener();

	// Updating flag to trigger the event on nextTick
	var updating = false;

	listener.on( 'immediate', function( prevNode, updated ){

		if( prevNode == 'now' ){
			if( !updating )
				return;
			updating = false;
			return me.trigger( 'update', frozen );
		}

		if( prevNode != frozen )
			return;

		frozen = updated;

		if( live )
			return me.trigger( 'update', updated );

		// Trigger on next tick
		if( !updating ){
			updating = true;
			Utils.nextTick( function(){
				if( updating ){
					updating = false;
					me.trigger( 'update', frozen );
				}
			});
		}
	});

	Utils.addNE( this, {
		get: function(){
			return frozen;
		},
		set: function( node ){
			var newNode = notify( 'reset', frozen, node );
			newNode.__.listener.trigger( 'immediate', frozen, newNode );
		}
	});

	Utils.addNE( this, { getData: this.get, setData: this.set } );

	// The event store
	this._events = [];
}

Freezer.prototype = Utils.createNonEnumerable({constructor: Freezer}, Emitter);
//#build

module.exports = Freezer;

},{"2":2,"4":4,"5":5,"6":6}],4:[function(require,module,exports){
'use strict';

var Utils = require(6),
	Mixins = require(5),
	Emitter = require(2)
;

//#build
var Frozen = {
	freeze: function( node, notify, freezeFn, live ){
		if( node && node.__ ){
			return node;
		}

		var me = this,
			frozen, mixin, cons
		;

		if( node.constructor == Array ){
			frozen = this.createArray( node.length );
		}
		else {
			frozen = Object.create( Mixins.Hash );
		}

		Utils.addNE( frozen, { __: {
			listener: false,
			parents: [],
			notify: notify,
			freezeFn: freezeFn,
			live: live || false
		}});

		// Freeze children
		Utils.each( node, function( child, key ){
			cons = child && child.constructor;
			if( cons == Array || cons == Object ){
				child = me.freeze( child, notify, freezeFn, live );
			}

			if( child && child.__ ){
				me.addParent( child, frozen );
			}

			frozen[ key ] = child;
		});

		freezeFn( frozen );

		return frozen;
	},

	update: function( type, node, options ){
		if( !this[ type ])
			return Utils.error( 'Unknown update type: ' + type );

		return this[ type ]( node, options );
	},

	reset: function( node, value ){
		var me = this,
			_ = node.__,
			frozen = value
		;

		if( !frozen.__ ){
			frozen = this.freeze( value, _.notify, _.freezeFn, _.live );
		}

		frozen.__.listener = _.listener;
		frozen.__.parents = _.parents;

		// Set back the parent on the children
		// that have been updated
		this.fixChildren( frozen, node );
		Utils.each( frozen, function( child ){
			if( child && child.__ ){
				me.removeParent( node );
				me.addParent( child, frozen );
			}
		});

		return frozen;
	},

	merge: function( node, attrs ){
		var _ = node.__,
			trans = _.trans,

			// Clone the attrs to not modify the argument
			attrs = Utils.extend( {}, attrs)
		;

		if( trans ){

			for( var attr in attrs )
				trans[ attr ] = attrs[ attr ];
			return node;
		}

		var me = this,
			frozen = this.copyMeta( node ),
			notify = _.notify,
			val, cons, key, isFrozen
		;

		Utils.each( node, function( child, key ){
			isFrozen = child && child.__;

			if( isFrozen ){
				me.removeParent( child, node );
			}

			val = attrs[ key ];
			if( !val ){
				if( isFrozen )
					me.addParent( child, frozen );
				return frozen[ key ] = child;
			}

			cons = val && val.constructor;

			if( cons == Array || cons == Object )
				val = me.freeze( val, notify, _.freezeFn, _.live );

			if( val && val.__ )
				me.addParent( val, frozen );

			delete attrs[ key ];

			frozen[ key ] = val;
		});


		for( key in attrs ) {
			val = attrs[ key ];
			cons = val && val.constructor;

			if( cons == Array || cons == Object )
				val = me.freeze( val, notify, _.freezeFn, _.live );

			if( val && val.__ )
				me.addParent( val, frozen );

			frozen[ key ] = val;
		}

		_.freezeFn( frozen );

		this.refreshParents( node, frozen );

		return frozen;
	},

	replace: function( node, replacement ) {

		var me = this,
			cons = replacement && replacement.constructor,
			_ = node.__,
			frozen = replacement
		;

		if( cons == Array || cons == Object ) {

			frozen = me.freeze( replacement, _.notify, _.freezeFn, _.live );

			frozen.__.parents = _.parents;

			// Add the current listener if exists, replacing a
			// previous listener in the frozen if existed
			if( _.listener )
				frozen.__.listener = _.listener;

			// Since the parents will be refreshed directly,
			// Trigger the listener here
			this.trigger( frozen, 'update', frozen, _.live );
		}

		// Refresh the parent nodes directly
		if( !_.parents.length && _.listener ){
			_.listener.trigger( 'immediate', node, frozen );
		}
		for (var i = _.parents.length - 1; i >= 0; i--) {
				this.refresh( _.parents[i], node, frozen );
		}
		return frozen;
	},

	remove: function( node, attrs ){
		var trans = node.__.trans;
		if( trans ){
			for( var l = attrs.length - 1; l >= 0; l-- )
				delete trans[ attrs[l] ];
			return node;
		}

		var me = this,
			frozen = this.copyMeta( node ),
			isFrozen
		;

		Utils.each( node, function( child, key ){
			isFrozen = child && child.__;

			if( isFrozen ){
				me.removeParent( child, node );
			}

			if( attrs.indexOf( key ) != -1 ){
				return;
			}

			if( isFrozen )
				me.addParent( child, frozen );

			frozen[ key ] = child;
		});

		node.__.freezeFn( frozen );
		this.refreshParents( node, frozen );

		return frozen;
	},

	splice: function( node, args ){
		var _ = node.__,
			trans = _.trans
		;

		if( trans ){
			trans.splice.apply( trans, args );
			return node;
		}

		var me = this,
			frozen = this.copyMeta( node ),
			index = args[0],
			deleteIndex = index + args[1],
			con, child
		;

		// Clone the array
		Utils.each( node, function( child, i ){

			if( child && child.__ ){
				me.removeParent( child, node );

				// Skip the nodes to delete
				if( i < index || i>= deleteIndex )
					me.addParent( child, frozen );
			}

			frozen[i] = child;
		});

		// Prepare the new nodes
		if( args.length > 1 ){
			for (var i = args.length - 1; i >= 2; i--) {
				child = args[i];
				con = child && child.constructor;

				if( con == Array || con == Object )
					child = this.freeze( child, _.notify, _.freezeFn, _.live );

				if( child && child.__ )
					this.addParent( child, frozen );

				args[i] = child;
			}
		}

		// splice
		Array.prototype.splice.apply( frozen, args );

		node.__.freezeFn( frozen );
		this.refreshParents( node, frozen );

		return frozen;
	},

	transact: function( node ) {
		var me = this,
			transacting = node.__.trans,
			trans
		;

		if( transacting )
			return transacting;

		trans = node.constructor == Array ? [] : {};

		Utils.each( node, function( child, key ){
			trans[ key ] = child;
		});

		node.__.trans = trans;

		// Call run automatically in case
		// the user forgot about it
		Utils.nextTick( function(){
			if( node.__.trans )
				me.run( node );
		});

		return trans;
	},

	run: function( node ) {
		var me = this,
			trans = node.__.trans
		;

		if( !trans )
			return node;

		// Remove the node as a parent
		Utils.each( trans, function( child, key ){
			if( child && child.__ ){
				me.removeParent( child, node );
			}
		});

		delete node.__.trans;

		var result = this.replace( node, trans );
		return result;
	},

	pivot: function( node ){
		node.__.pivot = 1;
		this.unpivot( node );
		return node;
	},

	unpivot: function( node ){
		Utils.nextTick( function(){
			node.__.pivot = 0;
		});
	},

	refresh: function( node, oldChild, newChild ){
		var me = this,
			trans = node.__.trans,
			found = 0
		;

		if( trans ){

			Utils.each( trans, function( child, key ){
				if( found ) return;

				if( child === oldChild ){

					trans[ key ] = newChild;
					found = 1;

					if( newChild && newChild.__ )
						me.addParent( newChild, node );
				}
			});

			return node;
		}

		var frozen = this.copyMeta( node ),
			replacement, __
		;

		Utils.each( node, function( child, key ){
			if( child === oldChild ){
				child = newChild;
			}

			if( child && (__ = child.__) ){
				me.removeParent( child, node );
				me.addParent( child, frozen );
			}

			frozen[ key ] = child;
		});

		node.__.freezeFn( frozen );

		this.refreshParents( node, frozen );
	},

	fixChildren: function( node, oldNode ){
		var me = this;
		Utils.each( node, function( child ){
			if( !child || !child.__ )
				return;

			// If the child is linked to the node,
			// maybe its children are not linked
			if( child.__.parents.indexOf( node ) != -1 )
				return me.fixChildren( child );

			// If the child wasn't linked it is sure
			// that it wasn't modified. Just link it
			// to the new parent
			if( child.__.parents.length == 1 )
				return child.__.parents = [ node ];

			if( oldNode )
				me.removeParent( child, oldNode );

			me.addParent( child, node );
		});
	},

	copyMeta: function( node ){
		var me = this,
			frozen
		;

		if( node.constructor == Array ){
			frozen = this.createArray( node.length );
		}
		else {
			frozen = Object.create( Mixins.Hash );
		}

		var _ = node.__;

		Utils.addNE( frozen, {__: {
			notify: _.notify,
			listener: _.listener,
			parents: _.parents.slice( 0 ),
			trans: _.trans,
			freezeFn: _.freezeFn,
			pivot: _.pivot,
			live: _.live
		}});

		if( _.pivot )
			this.unpivot( frozen );

		return frozen;
	},

	refreshParents: function( oldChild, newChild ){
		var _ = oldChild.__,
			i
		;

		this.trigger( newChild, 'update', newChild, _.live );

		if( !_.parents.length ){
			if( _.listener ){
				_.listener.trigger( 'immediate', oldChild, newChild );
			}
		}
		else {
			for (i = _.parents.length - 1; i >= 0; i--) {
				this.refresh( _.parents[i], oldChild, newChild );
			}
		}
	},

	removeParent: function( node, parent ){
		var parents = node.__.parents,
			index = parents.indexOf( parent )
		;

		if( index != -1 ){
			parents.splice( index, 1 );
		}
	},

	addParent: function( node, parent ){
		var parents = node.__.parents,
			index = parents.indexOf( parent )
		;

		if( index == -1 ){
			parents[ parents.length ] = parent;
		}
	},

	trigger: function( node, eventName, param, now ){
		var listener = node.__.listener;
		if( !listener )
			return;

		var ticking = listener.ticking;

		if( now ){
			if( ticking || param ){
				listener.ticking = 0;
				listener.trigger( eventName, ticking || param );
			}
			return;
		}

		listener.ticking = param;
		if( !ticking ){
			Utils.nextTick( function(){
				if( listener.ticking ){
					var updated = listener.ticking;
					listener.ticking = 0;
					listener.trigger( eventName, updated );
				}
			});
		}
	},

	createListener: function( frozen ){
		var l = frozen.__.listener;

		if( !l ) {
			l = Object.create(Emitter, {
				_events: {
					value: {},
					writable: true
				}
			});

			frozen.__.listener = l;
		}

		return l;
	},

	createArray: (function(){
		// Set createArray method
		if( [].__proto__ )
			return function( length ){
				var arr = new Array( length );
				arr.__proto__ = Mixins.List;
				return arr;
			}
		return function( length ){
			var arr = new Array( length ),
				methods = Mixins.arrayMethods
			;
			for( var m in methods ){
				arr[ m ] = methods[ m ];
			}
			return arr;
		}
	})()
};
//#build

module.exports = Frozen;

},{"2":2,"5":5,"6":6}],5:[function(require,module,exports){
'use strict';

var Utils = require(6);

//#build

/**
 * Creates non-enumerable property descriptors, to be used by Object.create.
 * @param  {Object} attrs Properties to create descriptors
 * @return {Object}       A hash with the descriptors.
 */
var createNE = function( attrs ){
	var ne = {};

	for( var key in attrs ){
		ne[ key ] = {
			writable: true,
			configurable: true,
			enumerable: false,
			value: attrs[ key]
		}
	}

	return ne;
}

var commonMethods = {
	set: function( attr, value ){
		var attrs = attr,
			update = this.__.trans
		;

		if( typeof attr != 'object' ){
			attrs = {};
			attrs[ attr ] = value;
		}

		if( !update ){
			for( var key in attrs ){
				update = update || this[ key ] !== attrs[ key ];
			}

			// No changes, just return the node
			if( !update )
				return this;
		}

		return this.__.notify( 'merge', this, attrs );
	},

	reset: function( attrs ) {
		return this.__.notify( 'replace', this, attrs );
	},

	getListener: function(){
		return this.__.notify( 'listener', this );
	},

	toJS: function(){
		var js;
		if( this.constructor == Array ){
			js = new Array( this.length );
		}
		else {
			js = {};
		}

		Utils.each( this, function( child, i ){
			if( child && child.__ )
				js[ i ] = child.toJS();
			else
				js[ i ] = child;
		});

		return js;
	},

	transact: function(){
		return this.__.notify( 'transact', this );
	},

	run: function(){
		return this.__.notify( 'run', this );
	},

	now: function(){
		return this.__.notify( 'now', this );
	},

	pivot: function(){
		return this.__.notify( 'pivot', this );
	}
};

var arrayMethods = Utils.extend({
	push: function( el ){
		return this.append( [el] );
	},

	append: function( els ){
		if( els && els.length )
			return this.__.notify( 'splice', this, [this.length, 0].concat( els ) );
		return this;
	},

	pop: function(){
		if( !this.length )
			return this;

		return this.__.notify( 'splice', this, [this.length -1, 1] );
	},

	unshift: function( el ){
		return this.prepend( [el] );
	},

	prepend: function( els ){
		if( els && els.length )
			return this.__.notify( 'splice', this, [0, 0].concat( els ) );
		return this;
	},

	shift: function(){
		if( !this.length )
			return this;

		return this.__.notify( 'splice', this, [0, 1] );
	},

	splice: function( index, toRemove, toAdd ){
		return this.__.notify( 'splice', this, arguments );
	}
}, commonMethods );

var FrozenArray = Object.create( Array.prototype, createNE( arrayMethods ) );

var Mixins = {

Hash: Object.create( Object.prototype, createNE( Utils.extend({
	remove: function( keys ){
		var filtered = [],
			k = keys
		;

		if( keys.constructor != Array )
			k = [ keys ];

		for( var i = 0, l = k.length; i<l; i++ ){
			if( this.hasOwnProperty( k[i] ) )
				filtered.push( k[i] );
		}

		if( filtered.length )
			return this.__.notify( 'remove', this, filtered );
		return this;
	}
}, commonMethods))),

List: FrozenArray,
arrayMethods: arrayMethods
};
//#build

module.exports = Mixins;

},{"6":6}],6:[function(require,module,exports){
'use strict';

//#build
var global = (new Function("return this")());

var Utils = {
	extend: function( ob, props ){
		for( var p in props ){
			ob[p] = props[p];
		}
		return ob;
	},

	createNonEnumerable: function( obj, proto ){
		var ne = {};
		for( var key in obj )
			ne[key] = {value: obj[key] };
		return Object.create( proto || {}, ne );
	},

	error: function( message ){
		var err = new Error( message );
		if( console )
			return console.error( err );
		else
			throw err;
	},

	each: function( o, clbk ){
		var i,l,keys;
		if( o && o.constructor == Array ){
			for (i = 0, l = o.length; i < l; i++)
				clbk( o[i], i );
		}
		else {
			keys = Object.keys( o );
			for( i = 0, l = keys.length; i < l; i++ )
				clbk( o[ keys[i] ], keys[i] );
		}
	},

	addNE: function( node, attrs ){
		for( var key in attrs ){
			Object.defineProperty( node, key, {
				enumerable: false,
				configurable: true,
				writable: true,
				value: attrs[ key ]
			});
		}
	},

	// nextTick - by stagas / public domain
  	nextTick: (function () {
      var queue = [],
			dirty = false,
			fn,
			hasPostMessage = !!global.postMessage && (typeof Window != 'undefined') && (global instanceof Window),
			messageName = 'nexttick',
			trigger = (function () {
				return hasPostMessage
					? function trigger () {
					global.postMessage(messageName, '*');
				}
				: function trigger () {
					setTimeout(function () { processQueue() }, 0);
				};
			}()),
			processQueue = (function () {
				return hasPostMessage
					? function processQueue (event) {
						if (event.source === global && event.data === messageName) {
							event.stopPropagation();
							flushQueue();
						}
					}
					: flushQueue;
      	})()
      ;

      function flushQueue () {
          while (fn = queue.shift()) {
              fn();
          }
          dirty = false;
      }

      function nextTick (fn) {
          queue.push(fn);
          if (dirty) return;
          dirty = true;
          trigger();
      }

      if (hasPostMessage) global.addEventListener('message', processQueue, true);

      nextTick.removeListener = function () {
          global.removeEventListener('message', processQueue, true);
      }

      return nextTick;
  })(),

  findPivot: function( node ){
  		if( !node || !node.__ )
  			return;

  		if( node.__.pivot )
  			return node;

  		var found = 0,
  			parents = node.__.parents,
  			i = 0,
  			parent
  		;

  		// Look up for the pivot in the parents
  		while( !found && i < parents.length ){
  			parent = parents[i];
  			if( parent.__.pivot )
  				found = parent;
  			i++;
  		}

  		if( found ){
  			return found;
  		}

  		// If not found, try with the parent's parents
  		i=0;
  		while( !found && i < parents.length ){
	  		found = this.findPivot( parents[i] );
	  		i++;
	  	}

  		return found;
  }
};
//#build


module.exports = Utils;

},{}],7:[function(require,module,exports){
//! moment.js
//! version : 2.11.2
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, function () { 'use strict';

    var hookCallback;

    function utils_hooks__hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function create_utc__createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            m._isValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function valid__createInvalid (flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    function isUndefined(input) {
        return input === void 0;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = utils_hooks__hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function Locale() {
    }

    // internal storage for locale config files
    var locales = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                locale_locales__getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function locale_locales__getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = locale_locales__getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, values) {
        if (values !== null) {
            values.abbr = name;
            locales[name] = locales[name] || new Locale();
            locales[name].set(values);

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    // returns locale data
    function locale_locales__getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }

    function get_set__get (mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function get_set__set (mom, unit, value) {
        if (mom.isValid()) {
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    // MOMENTS

    function getSet (units, value) {
        var unit;
        if (typeof units === 'object') {
            for (unit in units) {
                this.set(unit, units[unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;


    var regexes = {};

    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
        return isArray(this._months) ? this._months[m.month()] :
            this._months[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')$', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')$', 'i');
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false &&
                (typeof console !==  'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (firstTime) {
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(arguments).join(', ') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    utils_hooks__hooks.suppressDeprecationWarnings = false;

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    utils_hooks__hooks.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    function createDate (y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));

        //the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    utils_hooks__hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', false);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(utils_hooks__hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // constant that refers to the ISO standard
    utils_hooks__hooks.ISO_8601 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
            return;
        }

        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (getParsingFlags(config).bigHour === true &&
                config._a[HOUR] <= 12 &&
                config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!valid__isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || locale_locales__getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return valid__createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else if (isDate(input)) {
            config._d = input;
        } else {
            configFromInput(config);
        }

        if (!valid__isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date(utils_hooks__hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof(input) === 'object') {
            configFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function local__createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
         'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
         function () {
             var other = local__createLocal.apply(null, arguments);
             if (this.isValid() && other.isValid()) {
                 return other < this ? this : other;
             } else {
                 return valid__createInvalid();
             }
         }
     );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
        function () {
            var other = local__createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return valid__createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return local__createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = locale_locales__getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    // FORMATTING

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = ((string || '').match(matcher) || []);
        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? +input : +local__createLocal(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    utils_hooks__hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
            } else if (Math.abs(input) < 16) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            this.utcOffset(offsetFromString(matchOffset, this._i));
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? local__createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset () {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc () {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?\d*)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    var isoRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;

    function create__createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])        * sign,
                h  : toInt(match[HOUR])        * sign,
                m  : toInt(match[MINUTE])      * sign,
                s  : toInt(match[SECOND])      * sign,
                ms : toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                d : parseIso(match[4], sign),
                h : parseIso(match[5], sign),
                m : parseIso(match[6], sign),
                s : parseIso(match[7], sign),
                w : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    create__createDuration.fn = Duration.prototype;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {milliseconds: 0, months: 0};
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }

    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }

    var add_subtract__add      = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');

    function moment_calendar__calendar (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || local__createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            diff = this.diff(sod, 'days', true),
            format = diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format]() : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, local__createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return +this > +localInput;
        } else {
            return +localInput < +this.clone().startOf(units);
        }
    }

    function isBefore (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return +this < +localInput;
        } else {
            return +this.clone().endOf(units) < +localInput;
        }
    }

    function isBetween (from, to, units) {
        return this.isAfter(from, units) && this.isBefore(to, units);
    }

    function isSame (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            return +this === +localInput;
        } else {
            inputMs = +localInput;
            return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
        }
    }

    function isSameOrAfter (input, units) {
        return this.isSame(input, units) || this.isAfter(input,units);
    }

    function isSameOrBefore (input, units) {
        return this.isSame(input, units) || this.isBefore(input,units);
    }

    function diff (input, units, asFloat) {
        var that,
            zoneDelta,
            delta, output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        return -(wholeMonthDiff + adjust);
    }

    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function moment_format__toISOString () {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if (isFunction(Date.prototype.toISOString)) {
                // native implementation is ~50x faster, use it when we can
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }

    function format (inputString) {
        var output = formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 local__createLocal(time).isValid())) {
            return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow (withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 local__createLocal(time).isValid())) {
            return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow (withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    function startOf (units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
        case 'year':
            this.month(0);
            /* falls through */
        case 'quarter':
        case 'month':
            this.date(1);
            /* falls through */
        case 'week':
        case 'isoWeek':
        case 'day':
            this.hours(0);
            /* falls through */
        case 'hour':
            this.minutes(0);
            /* falls through */
        case 'minute':
            this.seconds(0);
            /* falls through */
        case 'second':
            this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf (units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }
        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function to_type__valueOf () {
        return +this._d - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(+this / 1000);
    }

    function toDate () {
        return this._offset ? new Date(+this) : this._d;
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON () {
        // JSON.stringify(new Date(NaN)) === 'null'
        return this.isValid() ? this.toISOString() : 'null';
    }

    function moment_valid__isValid () {
        return valid__isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy);
    }

    function getSetISOWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        // console.log("got", weekYear, week, weekday, "set", date.toISOString());
        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   matchWord);
    addRegexToken('ddd',  matchWord);
    addRegexToken('dddd', matchWord);

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
        return isArray(this._weekdays) ? this._weekdays[m.day()] :
            this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return this._weekdaysShort[m.day()];
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return this._weekdaysMin[m.day()];
    }

    function localeWeekdaysParse (weekdayName, format, strict) {
        var i, mom, regex;

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = local__createLocal([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.
        return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
    }

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var momentPrototype__proto = Moment.prototype;

    momentPrototype__proto.add               = add_subtract__add;
    momentPrototype__proto.calendar          = moment_calendar__calendar;
    momentPrototype__proto.clone             = clone;
    momentPrototype__proto.diff              = diff;
    momentPrototype__proto.endOf             = endOf;
    momentPrototype__proto.format            = format;
    momentPrototype__proto.from              = from;
    momentPrototype__proto.fromNow           = fromNow;
    momentPrototype__proto.to                = to;
    momentPrototype__proto.toNow             = toNow;
    momentPrototype__proto.get               = getSet;
    momentPrototype__proto.invalidAt         = invalidAt;
    momentPrototype__proto.isAfter           = isAfter;
    momentPrototype__proto.isBefore          = isBefore;
    momentPrototype__proto.isBetween         = isBetween;
    momentPrototype__proto.isSame            = isSame;
    momentPrototype__proto.isSameOrAfter     = isSameOrAfter;
    momentPrototype__proto.isSameOrBefore    = isSameOrBefore;
    momentPrototype__proto.isValid           = moment_valid__isValid;
    momentPrototype__proto.lang              = lang;
    momentPrototype__proto.locale            = locale;
    momentPrototype__proto.localeData        = localeData;
    momentPrototype__proto.max               = prototypeMax;
    momentPrototype__proto.min               = prototypeMin;
    momentPrototype__proto.parsingFlags      = parsingFlags;
    momentPrototype__proto.set               = getSet;
    momentPrototype__proto.startOf           = startOf;
    momentPrototype__proto.subtract          = add_subtract__subtract;
    momentPrototype__proto.toArray           = toArray;
    momentPrototype__proto.toObject          = toObject;
    momentPrototype__proto.toDate            = toDate;
    momentPrototype__proto.toISOString       = moment_format__toISOString;
    momentPrototype__proto.toJSON            = toJSON;
    momentPrototype__proto.toString          = toString;
    momentPrototype__proto.unix              = unix;
    momentPrototype__proto.valueOf           = to_type__valueOf;
    momentPrototype__proto.creationData      = creationData;

    // Year
    momentPrototype__proto.year       = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;

    // Week Year
    momentPrototype__proto.weekYear    = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

    // Quarter
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

    // Month
    momentPrototype__proto.month       = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;

    // Week
    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
    momentPrototype__proto.weeksInYear    = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

    // Day
    momentPrototype__proto.date       = getSetDayOfMonth;
    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear  = getSetDayOfYear;

    // Hour
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

    // Minute
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

    // Second
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

    // Millisecond
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

    // Offset
    momentPrototype__proto.utcOffset            = getSetOffset;
    momentPrototype__proto.utc                  = setOffsetToUTC;
    momentPrototype__proto.local                = setOffsetToLocal;
    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST                = isDaylightSavingTime;
    momentPrototype__proto.isDSTShifted         = isDaylightSavingTimeShifted;
    momentPrototype__proto.isLocal              = isLocal;
    momentPrototype__proto.isUtcOffset          = isUtcOffset;
    momentPrototype__proto.isUtc                = isUtc;
    momentPrototype__proto.isUTC                = isUtc;

    // Timezone
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;

    // Deprecations
    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);

    var momentPrototype = momentPrototype__proto;

    function moment__createUnix (input) {
        return local__createLocal(input * 1000);
    }

    function moment__createInZone () {
        return local__createLocal.apply(null, arguments).parseZone();
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function locale_calendar__calendar (key, mom, now) {
        var output = this._calendar[key];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    function preParsePostFormat (string) {
        return string;
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    function locale_set__set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _ordinalParseLenient.
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
    }

    var prototype__proto = Locale.prototype;

    prototype__proto._calendar       = defaultCalendar;
    prototype__proto.calendar        = locale_calendar__calendar;
    prototype__proto._longDateFormat = defaultLongDateFormat;
    prototype__proto.longDateFormat  = longDateFormat;
    prototype__proto._invalidDate    = defaultInvalidDate;
    prototype__proto.invalidDate     = invalidDate;
    prototype__proto._ordinal        = defaultOrdinal;
    prototype__proto.ordinal         = ordinal;
    prototype__proto._ordinalParse   = defaultOrdinalParse;
    prototype__proto.preparse        = preParsePostFormat;
    prototype__proto.postformat      = preParsePostFormat;
    prototype__proto._relativeTime   = defaultRelativeTime;
    prototype__proto.relativeTime    = relative__relativeTime;
    prototype__proto.pastFuture      = pastFuture;
    prototype__proto.set             = locale_set__set;

    // Month
    prototype__proto.months            =        localeMonths;
    prototype__proto._months           = defaultLocaleMonths;
    prototype__proto.monthsShort       =        localeMonthsShort;
    prototype__proto._monthsShort      = defaultLocaleMonthsShort;
    prototype__proto.monthsParse       =        localeMonthsParse;
    prototype__proto._monthsRegex      = defaultMonthsRegex;
    prototype__proto.monthsRegex       = monthsRegex;
    prototype__proto._monthsShortRegex = defaultMonthsShortRegex;
    prototype__proto.monthsShortRegex  = monthsShortRegex;

    // Week
    prototype__proto.week = localeWeek;
    prototype__proto._week = defaultLocaleWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

    // Day of Week
    prototype__proto.weekdays       =        localeWeekdays;
    prototype__proto._weekdays      = defaultLocaleWeekdays;
    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
    prototype__proto._weekdaysMin   = defaultLocaleWeekdaysMin;
    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
    prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
    prototype__proto.weekdaysParse  =        localeWeekdaysParse;

    // Hours
    prototype__proto.isPM = localeIsPM;
    prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
    prototype__proto.meridiem = localeMeridiem;

    function lists__get (format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function list (format, index, field, count, setter) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return lists__get(format, index, field, setter);
        }

        var i;
        var out = [];
        for (i = 0; i < count; i++) {
            out[i] = lists__get(format, i, field, setter);
        }
        return out;
    }

    function lists__listMonths (format, index) {
        return list(format, index, 'months', 12, 'month');
    }

    function lists__listMonthsShort (format, index) {
        return list(format, index, 'monthsShort', 12, 'month');
    }

    function lists__listWeekdays (format, index) {
        return list(format, index, 'weekdays', 7, 'day');
    }

    function lists__listWeekdaysShort (format, index) {
        return list(format, index, 'weekdaysShort', 7, 'day');
    }

    function lists__listWeekdaysMin (format, index) {
        return list(format, index, 'weekdaysMin', 7, 'day');
    }

    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

    var mathAbs = Math.abs;

    function duration_abs__abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function duration_add_subtract__addSubtract (duration, input, value, direction) {
        var other = create__createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function duration_add_subtract__add (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function duration_add_subtract__subtract (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days   = this._days   + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function duration_as__valueOf () {
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');

    function duration_get__get (units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }

    function makeGetter(name) {
        return function () {
            return this._data[name];
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        s: 45,  // seconds to minute
        m: 45,  // minutes to hour
        h: 22,  // hours to day
        d: 26,  // days to month
        M: 11   // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds < thresholds.s && ['s', seconds]  ||
                minutes <= 1           && ['m']           ||
                minutes < thresholds.m && ['mm', minutes] ||
                hours   <= 1           && ['h']           ||
                hours   < thresholds.h && ['hh', hours]   ||
                days    <= 1           && ['d']           ||
                days    < thresholds.d && ['dd', days]    ||
                months  <= 1           && ['M']           ||
                months  < thresholds.M && ['MM', months]  ||
                years   <= 1           && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set a threshold for relative time strings
    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }

    function humanize (withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var iso_string__abs = Math.abs;

    function iso_string__toISOString() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days         = iso_string__abs(this._days);
        var months       = iso_string__abs(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        return (total < 0 ? '-' : '') +
            'P' +
            (Y ? Y + 'Y' : '') +
            (M ? M + 'M' : '') +
            (D ? D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? h + 'H' : '') +
            (m ? m + 'M' : '') +
            (s ? s + 'S' : '');
    }

    var duration_prototype__proto = Duration.prototype;

    duration_prototype__proto.abs            = duration_abs__abs;
    duration_prototype__proto.add            = duration_add_subtract__add;
    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
    duration_prototype__proto.as             = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds      = asSeconds;
    duration_prototype__proto.asMinutes      = asMinutes;
    duration_prototype__proto.asHours        = asHours;
    duration_prototype__proto.asDays         = asDays;
    duration_prototype__proto.asWeeks        = asWeeks;
    duration_prototype__proto.asMonths       = asMonths;
    duration_prototype__proto.asYears        = asYears;
    duration_prototype__proto.valueOf        = duration_as__valueOf;
    duration_prototype__proto._bubble        = bubble;
    duration_prototype__proto.get            = duration_get__get;
    duration_prototype__proto.milliseconds   = milliseconds;
    duration_prototype__proto.seconds        = seconds;
    duration_prototype__proto.minutes        = minutes;
    duration_prototype__proto.hours          = hours;
    duration_prototype__proto.days           = days;
    duration_prototype__proto.weeks          = weeks;
    duration_prototype__proto.months         = months;
    duration_prototype__proto.years          = years;
    duration_prototype__proto.humanize       = humanize;
    duration_prototype__proto.toISOString    = iso_string__toISOString;
    duration_prototype__proto.toString       = iso_string__toISOString;
    duration_prototype__proto.toJSON         = iso_string__toISOString;
    duration_prototype__proto.locale         = locale;
    duration_prototype__proto.localeData     = localeData;

    // Deprecations
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    utils_hooks__hooks.version = '2.11.2';

    setHookCallback(local__createLocal);

    utils_hooks__hooks.fn                    = momentPrototype;
    utils_hooks__hooks.min                   = min;
    utils_hooks__hooks.max                   = max;
    utils_hooks__hooks.now                   = now;
    utils_hooks__hooks.utc                   = create_utc__createUTC;
    utils_hooks__hooks.unix                  = moment__createUnix;
    utils_hooks__hooks.months                = lists__listMonths;
    utils_hooks__hooks.isDate                = isDate;
    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid               = valid__createInvalid;
    utils_hooks__hooks.duration              = create__createDuration;
    utils_hooks__hooks.isMoment              = isMoment;
    utils_hooks__hooks.weekdays              = lists__listWeekdays;
    utils_hooks__hooks.parseZone             = moment__createInZone;
    utils_hooks__hooks.localeData            = locale_locales__getLocale;
    utils_hooks__hooks.isDuration            = isDuration;
    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale          = defineLocale;
    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;
    utils_hooks__hooks.prototype             = momentPrototype;

    var _moment = utils_hooks__hooks;

    return _moment;

}));
},{}],8:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],9:[function(require,module,exports){
'use strict';

var React = require("react");
var Axe = require(17);
var imUtils = require(26);
var _ = require(8);

/*
	{
		abs: [Axe],
		ord: [Axe]
	}
*/

var Axes = React.createClass({
	displayName: 'Axes',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	abscissa: function abscissa() {
		var css = this.props.state.css;
		return _.map(this.props.state.abs, function (p) {
			return p.show ? React.createElement(Axe, { className: 'xAxis', key: p.key, css: css, state: p }) : null;
		});
	},

	ordinate: function ordinate() {
		var css = this.props.state.css;
		return _.map(this.props.state.ord, function (p) {
			return p.show ? React.createElement(Axe, { className: 'yAxis', key: p.key, css: css, state: p }) : null;
		});
	},

	render: function render() {

		return React.createElement('g', null, this.abscissa(), this.ordinate());
	}

});

module.exports = Axes;

},{"17":17,"26":26,"8":8,"react":"react"}],10:[function(require,module,exports){
'use strict';

var React = require("react");

var imUtils = require(26);

/*
	{
		width: ,
		height: ,
		color: ,
		spaceX: {
			min: , 
			max:
		},
		spaceY: {
			min: ,
			max:
		}
	}
*/

var Background = React.createClass({
	displayName: 'Background',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {
		var x = this.props.state.spaceX.min;
		var y = this.props.state.spaceY.max;
		var width = this.props.state.spaceX.max - this.props.state.spaceX.min;
		var height = this.props.state.spaceY.min - this.props.state.spaceY.max;
		return this.props.state.color === 'none' ? null : React.createElement('rect', { width: width, height: height, strokeWidth: '0', fill: this.props.state.color, x: x, y: y });
	}
});

module.exports = Background;

},{"26":26,"react":"react"}],11:[function(require,module,exports){
'use strict';

var React = require("react");
var imUtils = require(26);

var Cadre = React.createClass({
	displayName: 'Cadre',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.cadre, this.props.cadre);
	},

	render: function render() {
		return React.createElement('rect', { width: this.props.width, height: this.props.height, strokeWidth: '1', stroke: 'black', fill: 'none', x: '0', y: '0' });
	}
});

module.exports = Cadre;

},{"26":26,"react":"react"}],12:[function(require,module,exports){
'use strict';

var React = require("react");
var _ = require(8);
var grapher = require(43);
var imUtils = require(26);

/*
	{
		curves: [{
			key: '', 
			points: [{}],
			props: {
			}
		}]
	}
*/

var Curves = React.createClass({
	displayName: 'Curves',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {
		return React.createElement('g', null, _.map(this.props.state, function (curve) {
			return grapher(curve.type, curve);
		}));
	}

});

module.exports = Curves;

},{"26":26,"43":43,"8":8,"react":"react"}],13:[function(require,module,exports){
'use strict';

var React = require("react");
var Axes = require(9);
var Curves = require(12);
var Cadre = require(11);
var Background = require(10);
var Foreground = require(14);
var Title = require(16);

var imUtils = require(26);

/*
	{
		width: ,
		height: ,
		cadre: Cadre,
		background: Background,
		title: Title,
		axes: Axes,
		curves: Curves,
		foreground: Foreground
	}
*/

var Graph = React.createClass({
	displayName: 'Graph',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	orderAG: function orderAG() {
		return this.props.state.axisOnTop === true ? React.createElement('g', null, React.createElement(Curves, { state: this.props.state.curves }), React.createElement(Axes, { state: this.props.state.axes })) : React.createElement('g', null, React.createElement(Axes, { state: this.props.state.axes }), React.createElement(Curves, { state: this.props.state.curves }));
	},

	render: function render() {
		var state = this.props.state;
		return React.createElement('svg', { width: state.width, height: state.height }, state.cadre ? React.createElement(Cadre, { width: state.width, height: state.height }) : null, React.createElement(Background, { state: state.background }), React.createElement(Title, { state: state.title }), this.orderAG(), React.createElement(Foreground, { state: state.foreground, pWidth: state.width, pHeight: state.height }));
	}
});

module.exports = Graph;

},{"10":10,"11":11,"12":12,"14":14,"16":16,"26":26,"9":9,"react":"react"}],14:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i];for (var key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				target[key] = source[key];
			}
		}
	}return target;
};

var React = require("react");
var utils = require(35);
var imUtils = require(26);
var sptr = require(33);

var Foreground = React.createClass({
	displayName: 'Foreground',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {
		if (utils.isNil(this.props.state.content)) {
			return null;
		}
		var wxc = utils.isNil(this.props.state.x) ? utils.isNil(this.props.state.ix) ? this.props.state.cx - this.props.state.width / 2 + this.props.pWidth / 2 : //pixels
		sptr.fromPic(this.props.state.ds.x, this.props.state.ix) : // implicit system
		sptr.toC(this.props.state.ds.x, this.props.state.x); // data space
		var wyc = utils.isNil(this.props.state.y) ? utils.isNil(this.props.state.iy) ? this.props.state.cy + this.props.state.height / 2 + this.props.pHeight / 2 : //pixels
		sptr.fromPic(this.props.state.ds.y, this.props.state.iy) : // implicit
		sptr.toC(this.props.state.ds.y, this.props.state.y);
		var trans = 'translate(' + wxc + ',' + wyc + ')';
		return React.createElement('g', _extends({ transform: trans }, this.props.state), this.props.state.content());
	}
});

module.exports = Foreground;

},{"26":26,"33":33,"35":35,"react":"react"}],15:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i];for (var key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				target[key] = source[key];
			}
		}
	}return target;
};

var React = require("react");
var Drawer = require(13);

var core = require(30);
var _ = require(8);

var Graph = React.createClass({
	displayName: 'Graph',

	componentWillMount: function componentWillMount() {
		if (this.props.__preprocessed) {
			this.props.updateGraph(this);
		}
	},

	render: function render() {

		var props = this.props.__preprocessed ? this.props.props() : core.process(this.props).get();

		return React.createElement(Drawer, { state: props });
	}
});

Graph.Legend = React.createClass({
	displayName: 'Legend',

	getDefaultProps: function getDefaultProps() {
		return {
			state: null
		};
	},

	table: function table(tab) {

		var tabline = function tabline(line, idx) {
			var icon = {
				width: line.icon.props.width
			};
			return React.createElement('tr', { key: idx }, React.createElement('td', { style: icon }, line.icon), React.createElement('td', null, line.label));
		};

		return React.createElement('table', this.props, React.createElement('tbody', null, _.map(tab, function (line, idx) {
			return tabline(line, idx);
		})));
	},

	line: function line(leg) {
		var print = function print(l, idx) {
			// a little depth to the icon
			// a little space to breathe
			// here to avoid use of CSS, easyness of use
			// for a third party
			var margin = {
				style: {
					marginRight: '10pt'
				}
			};
			return React.createElement('span', _extends({ key: idx }, margin), React.createElement('span', { verticalAlign: 'sub' }, l.icon), React.createElement('span', null, l.label));
		};

		return React.createElement('div', this.props, _.map(leg, function (l, idx) {
			return print(l, idx);
		}));
	},

	legend: function legend(leg) {
		return !!this.props.line ? this.line(leg) : this.table(leg);
	},

	render: function render() {
		var legend = this.props.preprocessed === true ? this.props.legend() : core.processLegend(this.props);
		return !!legend ? this.legend(legend) : null;
	}
});

module.exports = Graph;

},{"13":13,"30":30,"8":8,"react":"react"}],16:[function(require,module,exports){
'use strict';

var React = require("react");

var imUtils = require(26);

var Title = React.createClass({
	displayName: 'Title',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {
		var xT = this.props.state.width / 2;
		var yT = this.props.state.FSize + 5; // see defaults in space-mgr, its 10 px margin
		return !!this.props.state.title && this.props.state.title.length !== 0 ? React.createElement('text', { textAnchor: 'middle', fontSize: this.props.state.FSize, x: xT, y: yT }, this.props.state.title) : null;
	}
});

module.exports = Title;

},{"26":26,"react":"react"}],17:[function(require,module,exports){
'use strict';

var React = require("react");
var Tick = require(20);
var AxisLine = require(18);
var _ = require(8);
var imUtils = require(26);

/*
	{
		axisLine: AxisLine,
		ticks: [Tick]
	}
*/

var Axe = React.createClass({
	displayName: 'Axe',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {
		var _this = this;

		var axisName = this.props.className + 'Line';
		var tickName = this.props.className + 'Tick';

		return React.createElement('g', null, _.map(this.props.state.ticks, function (tick) {
			return React.createElement(Tick, { className: tickName, css: _this.props.css, key: tick.key, state: tick });
		}), React.createElement(AxisLine, { className: axisName, css: this.props.css, state: this.props.state.axisLine }));
	}
});

module.exports = Axe;

},{"18":18,"20":20,"26":26,"8":8,"react":"react"}],18:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i];for (var key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				target[key] = source[key];
			}
		}
	}return target;
};

var React = require("react");
var Label = require(19);
var utils = require(35);
var imUtils = require(26);

/*
	{
		show: true || false,

	///// line part
		line: {
			CS: ''
			start: {x,y},
			end: {x, y},
			origin: {x,y},
			radius: {x, y},
			color: '',
			width:,
		},

	/// label part
		label: Label 

 /// common factor part
		comFac: {
			factor: ,
			offset: {x, y},
			FSize: ,
			anchor: '',
			color: ''
		}

	}

*/

var AxisLine = React.createClass({
	displayName: 'AxisLine',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	axis: function axis() {
		var lprops = this.props.state.line;

		var lp = this.props.css ? null : {
			stroke: lprops.color,
			strokeWidth: lprops.width
		};

		switch (lprops.CS) {
			case 'cart':
				return React.createElement('line', _extends({ className: this.props.className }, lp, {
					x1: lprops.start.x, x2: lprops.end.x, y1: lprops.start.y, y2: lprops.end.y }));
			case 'polar':
				return React.createElement('ellipse', _extends({ className: this.props.className }, lp, {
					cx: lprops.origin.x, cy: lprops.origin.y, rx: lprops.radius.x, ry: lprops.radius.y }));
			default:
				throw new Error('Unknown coordinate system: "' + this.props.state.CS + '"');
		}
	},

	textOffset: function textOffset(fs, text, dir) {

		var fd = 0.25 * fs; // font depth, 25 %
		var fh = 0.75 * fs; // font height, 75 %

		// arbitrary values, from some font:
		// width "m" = 40 px
		// width "M" = 45 px => used
		var labelWidthOff = -text.length * 22.5;
		var labelHeightOff = function labelHeightOff(dir) {
			return dir > 0 ? fh : fd;
		};

		return {
			x: dir.x !== 0 ? labelHeightOff(dir.x) : labelWidthOff,
			y: dir.y !== 0 ? labelHeightOff(dir.y) : labelWidthOff
		};
	},

	factor: function factor() {
		var props = this.props.state.comFac;
		if (utils.isNil(props.factor) || props.factor === 1) {
			return null;
		}

		var dir = utils.direction(this.props.state.line);
		dir.x = Math.sqrt(dir.x / dir.line);
		dir.y = Math.sqrt(dir.y / dir.line);

		var offset = this.textOffset(props.Fsize, '10-10', dir); // if more than that, there are questions to be asked...

		var fac = {
			x: props.offset.x + this.props.state.line.end.x + dir.x * (offset.x + 10),
			y: -props.offset.y + this.props.state.line.end.y + dir.y * (offset.y + 10)
		};
		var trans = 'translate(' + fac.x + ',' + fac.y + ')';

		var mgr = utils.mgr(props.factor);
		var om = mgr.orderMag(props.factor);
		return React.createElement('g', { transform: trans }, React.createElement('circle', { x: '0', y: '0', r: '1' }), React.createElement('text', { x: '0', y: '0', fill: props.color, textAnchor: 'end', fontSize: props.Fsize }, '10'), React.createElement('text', { x: '0', y: -0.5 * props.Fsize, fontSize: props.Fsize, textAnchor: 'start' }, om));
	},

	render: function render() {

		var labName = this.props.className + 'Label';

		return this.props.state.show === false ? null : React.createElement('g', null, this.axis(), React.createElement(Label, { className: labName, css: this.props.css, state: this.props.state.label }), this.factor());
	}

});

module.exports = AxisLine;

},{"19":19,"26":26,"35":35,"react":"react"}],19:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i];for (var key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				target[key] = source[key];
			}
		}
	}return target;
};

var React = require("react");

var space = require(33);
var imUtils = require(26);

/*
	{
		ds: {x: , y:},
		position: {x: , y:},
		label: '',
		FSize: ,
		offset: {x, y},
		anchor: '',
		color: '',
		dir: {x, y},
		rotate: true || false,
		transform: true || false
	},
*/

var Label = React.createClass({
	displayName: 'Label',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {
		if (this.props.state.label.length === 0) {
			return null;
		}

		// label
		// => theta = arctan(y/x) [-90,90]

		var state = this.props.state;

		var xL = (state.transform ? space.toC(state.ds.x, state.position.x) : state.position.x) + state.offset.x;
		var yL = (state.transform ? space.toC(state.ds.y, state.position.y) : state.position.y) + state.offset.y;

		var theta = state.rotate ? Math.floor(Math.atan(-Math.sqrt(state.dir.y / state.dir.x)) * 180 / Math.PI) : 0; // in degrees

		var rotate = 'rotate(' + theta + ' ' + xL + ' ' + yL + ')';

		var labProps = this.props.css ? null : {
			fill: state.color,
			fontSize: state.FSize
		};

		return React.createElement('text', _extends({ className: this.props.className, x: xL, y: yL, transform: rotate, textAnchor: state.anchor }, labProps), state.label);
	}
});

module.exports = Label;

},{"26":26,"33":33,"react":"react"}],20:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i];for (var key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				target[key] = source[key];
			}
		}
	}return target;
};

var React = require("react");
var Label = require(19);

var sp = require(33);
var imUtils = require(26);

/*
	{
		// long thin grey line
		grid: {
			show: true || false,
			color: '',
			length: ,
			width: 
		},

	// tick
		tick: {
			show: true || false,
			color: '',
			position: {x, y},
			ds: {x, y},
			length: ,
			dir: {x, y},
			width: ,
			out:
		},

	// tick label
		label: Label
	}
*/

var Tick = React.createClass({
	displayName: 'Tick',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	// grid
	grid: function grid() {

		var gprops = this.props.state.grid;

		if (gprops.show === false) {
			return null;
		}

		var start = {
			x: sp.toC(this.props.state.tick.ds.x, this.props.state.tick.position.x),
			y: sp.toC(this.props.state.tick.ds.y, this.props.state.tick.position.y)
		};

		var end = {
			x: start.x + this.props.state.tick.dir.x * sp.toCwidth(this.props.state.tick.ds.x, gprops.length),
			y: start.y - this.props.state.tick.dir.y * sp.toCwidth(this.props.state.tick.ds.y, gprops.length)
		};

		var gridName = this.props.className + 'Grid';
		var tickProps = this.props.css ? null : {
			stroke: gprops.color,
			strokeWidth: gprops.width
		};

		return React.createElement('line', _extends({ className: gridName, x1: start.x, x2: end.x, y1: start.y, y2: end.y }, tickProps));
	},

	tick: function tick() {

		var tprops = this.props.state.tick;

		if (tprops.show === false) {
			return null;
		}

		var x1 = sp.toC(tprops.ds.x, tprops.position.x) - tprops.dir.x * tprops.length * tprops.out;
		var y1 = sp.toC(tprops.ds.y, tprops.position.y) + tprops.dir.y * tprops.length * tprops.out; // beware about y sign!!
		var x2 = x1 + tprops.dir.x * tprops.length;
		var y2 = y1 - tprops.dir.y * tprops.length; // beware about y sign!!

		var linePar = this.props.css ? null : {
			stroke: tprops.color,
			strokeWidth: tprops.width
		};

		return React.createElement('line', _extends({ className: this.props.className, x1: x1, x2: x2, y1: y1, y2: y2 }, linePar));
	},

	label: function label() {
		if (this.props.state.label.show === false) {
			return null;
		}
		var labelName = this.props.className + 'Label';
		return React.createElement(Label, { className: labelName, css: this.props.css, state: this.props.state.label });
	},

	noShow: function noShow() {
		return !(this.props.state.tick.show || this.props.state.grid.show || this.props.state.label.show);
	},

	render: function render() {

		return this.noShow() ? null : React.createElement('g', null, this.grid(), this.tick(), this.label());
	}
});

module.exports = Tick;

},{"19":19,"26":26,"33":33,"react":"react"}],21:[function(require,module,exports){
'use strict';

var utils = require(35);

/*
	{
		show: true || false,
	///// line part
		line: {
			CS: ''
			start: {x,y},
			end: {x, y},
			origin: {x,y},
			radius: {x, y},
			color: '',
			width:,
		},

	/// label part
		label: Label = {
			label: '',
			FSize: ,
			offset: {x, y},
			anchor: ''
			color: '',
			dir: {x, y}
		},

 /// common factor part
		comFac: {
			factor: ,
			offset: {x, y},
			FSize: ,
			anchor
		}
	}
*/

var m = {};

m.VM = function (ds, props, partnerDs, dir) {

	var show = props.show;

	/*
 		line: {
 			CS: ''
 			start: {x,y},
 			end: {x, y},
 			origin: {x,y},
 			radius: {x, y},
 			color: '',
 			width:,
 		},
 */

	var line = {};

	var tmp = {
		color: true,
		width: true
	};

	var othdir = dir === 'x' ? 'y' : 'x';
	line.CS = props.CS;
	// cart
	line.start = {};
	line.start[dir] = ds.c.min;
	line.start[othdir] = props.placement === 'right' || props.placement === 'top' ? partnerDs.c.max : partnerDs.c.min;
	line.end = {};
	line.end[dir] = ds.c.max;
	line.end[othdir] = line.start[othdir];
	// polar
	line.origin = {};
	line.origin[dir] = (ds.c.min + ds.c.max) / 2;
	line.origin[othdir] = (partnerDs.c.min + partnerDs.c.max) / 2;
	line.radius = {};
	line.radius[dir] = Math.abs(ds.c.max - ds.c.min) / 2;
	line.radius[othdir] = Math.abs(partnerDs.c.max - partnerDs.c.min) / 2;

	for (var u in tmp) {
		line[u] = props[u];
	}

	/*
 		label: {
 			ds: {x:, y: },
 			position: {x: , y:},
 			label: '',
 			FSize: ,
 			offset: {x, y},
 			anchor: '',
 			color: '',
 			dir
 		},
 */

	var lineDir = utils.direction(line);
	var label = {
		label: props.label,
		FSize: props.labelFSize,
		anchor: props.labelAnchor,
		color: props.labelColor,
		dir: {
			x: Math.sqrt(lineDir.x / lineDir.line),
			y: Math.sqrt(lineDir.y / lineDir.line)
		},
		rotate: true,
		transform: false
	};

	label.position = {
		x: (line.end.x + line.start.x) / 2,
		y: (line.end.y + line.start.y) / 2
	};

	// & anchoring the text
	var fd = 0.25 * label.FSize; // font depth, 25 %
	var fh = 0.75 * label.FSize; // font height, 75 %
	var defOff = props.empty ? 20 : 40;

	var offsetLab = function () {
		switch (props.placement) {
			case 'top':
				return {
					x: 0,
					y: -fd - defOff
				};
			case 'bottom':
				return {
					x: 0,
					y: fh + defOff
				};
			case 'left':
				return {
					x: -fd - defOff,
					y: 0
				};
			case 'right':
				return {
					x: fd + defOff,
					y: 0
				};
			default:
				throw new Error('Where is this axis: ' + props.placement);
		}
	}();

	label.offset = {
		x: offsetLab.x + props.labelOffset.x,
		y: offsetLab.y + props.labelOffset.y
	};

	label.ds = {};
	label.ds[dir] = ds;
	label.ds[othdir] = partnerDs;

	/*
 		comFac: {
 			factor: ,
 			offset: {x, y},
 			FSize: ,
 			anchor: '',
 			color: ''
 		}
 */

	var comFac = {
		factor: props.factor,
		offset: props.factorOffset,
		anchor: props.factorAnchor,
		Fsize: props.factorFSize,
		color: props.factorColor
	};

	return {
		show: show,
		line: line,
		label: label,
		comFac: comFac
	};
};

module.exports = m;

},{"35":35}],22:[function(require,module,exports){
'use strict';

var _ = require(8);
var utils = require(35);
var ticker = require(34);

/*
	{
		// long thin grey line
		grid: {
			show: true || false,
			color: '',
			length: ,
			width: 
		},

	// tick
		tick: {
			show: true || false,
			color: '',
			position: {x, y},
			ds: {x, y},
			length: ,
			dir: {x, y},
			width: ,
			out:
		},

	// tick label
		label: Label = {
			ds: {x:, y: },
			position: {x: , y:},
			label: '',
			FSize: ,
			offset: {x, y},
			anchor: '',
			color: '',
			dir: {x, y}
		}
	}
*/

var m = {};

m.VM = function (ds, partner, bounds, dir, locProps, comFac, axisKey) {

	//// general defs

	var othdir = dir === 'x' ? 'y' : 'x';

	// min max of the axis
	var min = bounds.min;
	var max = bounds.max;

	// all ticks are computed along, we need to 
	// know for each tick which it is
	var majProps = locProps.ticks.major;
	var minProps = locProps.ticks.minor;
	var majGrid = locProps.grid.major;
	var minGrid = locProps.grid.minor;

	// do we have labels? Only majorTicks
	var ticksLabel = locProps.tickLabels;
	// do we want the minor ticks to be computed?
	// do we want the minor grid?
	var minor = minProps.show === true || locProps.grid.minor.show === true;

	return locProps.empty ? [] : _.map(ticker.ticks(min, max, ticksLabel, minor, comFac), function (tick, idx) {
		/*
  		tick: {
  			show: true || false,
  			color: '',
  			position: {x, y},
  			length: ,
  			dir: {x, y},
  			width: ,
  			out:
  		},
  */
		var ticksProps = {};
		var p = tick.minor ? minProps : majProps;
		var tmp = {
			show: true,
			color: true,
			length: true,
			out: true,
			width: true
		};

		for (var u in tmp) {
			ticksProps[u] = utils.isNil(tick[u]) ? p[u] : tick[u];
		}
		ticksProps.position = {};
		ticksProps.position[dir] = tick.position;
		ticksProps.position[othdir] = partner.pos;
		ticksProps.ds = ds;

		ticksProps.dir = {};
		ticksProps.dir[dir] = 0;
		ticksProps.dir[othdir] = locProps.placement === 'right' || locProps.placement === 'top' ? -1 : 1;

		if (tick.extra) {
			ticksProps.show = tick.show;
		}

		var mgr = {
			x: utils.mgr(ticksProps.position.x),
			y: utils.mgr(ticksProps.position.y)
		};

		/*
  		label: Label = {
  			ds: {x:, y: },
  			position: {x: , y:},
  			label: '',
  			FSize: ,
  			offset: {x, y},
  			anchor: '',
  			color: '',
  			dir: {x, y}
  		}
  */

		var labelProps = {
			ds: ds,
			label: p.labelize(tick.position) === false ? tick.label : p.labelize(tick.position),
			FSize: p.labelFSize || 15,
			color: p.labelColor,
			rotate: false,
			transform: true,
			show: tick.showLabel || ticksProps.show
		};
		labelProps.dir = {};
		labelProps.dir[dir] = locProps.placement === 'top' || locProps.placement === 'right' ? -1 : 1;
		labelProps.dir[othdir] = 0;

		var addPerp = tick.minor ? 3.75 : 0;
		var offsetCspace = {
			x: p.labelOffset.x,
			y: tick.offset.perp + addPerp + p.labelOffset.y
		};

		var offset = {
			x: labelProps.dir.x !== 0 ? tick.offset.along : 0,
			y: labelProps.dir.y !== 0 ? tick.offset.along : 0
		};

		// adding a little margin
		// & anchoring the text
		var fd = 0.25 * labelProps.FSize; // font depth, 25 %
		var fh = 0.75 * labelProps.FSize; // font height, 75 %
		var defOff = 8;

		var anchor = function () {
			switch (locProps.placement) {
				case 'top':
					return {
						anchor: 'middle',
						off: {
							x: 0,
							y: -fd - defOff
						}
					};
				case 'bottom':
					return {
						anchor: 'middle',
						off: {
							x: 0,
							y: fh + defOff
						}
					};
				case 'left':
					return {
						anchor: 'end',
						off: {
							x: defOff,
							y: fd
						}
					};
				case 'right':
					return {
						anchor: 'start',
						off: {
							x: defOff,
							y: fd
						}
					};
				default:
					throw new Error('Where is this axis: ' + locProps.placement);
			}
		}();
		labelProps.anchor = anchor.anchor;
		offsetCspace.x += anchor.off.x;
		offsetCspace.y += anchor.off.y;
		if (locProps.placement === 'left') {
			offsetCspace.x *= -1;
		}

		labelProps.position = {
			x: mgr.x.add(ticksProps.position.x, offset.x),
			y: mgr.y.add(ticksProps.position.y, offset.y)
		};

		labelProps.offset = offsetCspace;

		/*
  		grid: {
  			show: true || false,
  			color: '',
  			length: ,
  			width: 
  		},
  */
		var gridProps = {};
		p = tick.extra ? tick.grid : tick.minor ? minGrid : majGrid;
		tmp = {
			show: true,
			color: true,
			width: true
		};

		var cus = tick.grid || {};
		for (u in tmp) {
			gridProps[u] = utils.isNil(cus[u]) ? p[u] : cus[u];
		}
		gridProps.length = partner.length;

		var tickKey = axisKey + '.t.' + idx;
		return {
			key: tickKey,
			tick: ticksProps,
			grid: gridProps,
			label: labelProps
		};
	});
};

module.exports = m;

},{"34":34,"35":35,"8":8}],23:[function(require,module,exports){
'use strict';

var _ = require(8);
var utils = require(35);
var shader = require(24);
var axisLine = require(21);
var ticks = require(22);
var plainVM = require(45);
var barChartVM = require(42);
var stairsVM = require(46);
var pieVM = require(44);
var dotVM = require(53);
var squareVM = require(55);
var barVM = require(52);
// pin
var pinMgr = require(54);

// graph
var graphVM = {};
graphVM.plain = graphVM.Plain = plainVM.VM;
graphVM.bars = graphVM.Bars = barChartVM.VM;
graphVM.ybars = graphVM.yBars = barChartVM.VM;
graphVM.stairs = graphVM.Stairs = stairsVM.VM;
graphVM.pie = graphVM.Pie = pieVM.VM;

// marks
var marksVM = {};
marksVM.opendot = marksVM.OpenDot = dotVM.OVM;
marksVM.dot = marksVM.Dot = dotVM.VM;
marksVM.opensquare = marksVM.OpenSquare = squareVM.OVM;
marksVM.square = marksVM.Square = squareVM.VM;
marksVM.bar = marksVM.Bar = barVM.VM;

var curve = function curve(spaces, serie, data, props, idx) {

	// 1 - find ds: {x: , y:}
	// common to everyone

	// we add the world
	// we find the proper x & y axis
	var xplace = 'bottom';
	if (!!data.abs && !!data.abs.axis) {
		xplace = data.abs.axis;
	}

	var yplace = 'left';
	if (!!data.ord && !!data.ord.axis) {
		yplace = data.ord.axis;
	}
	var ds = {
		x: spaces.x[xplace],
		y: spaces.y[yplace]
	};

	// 2 - line of graph
	var gtype = data.type || 'Plain';

	// positions are offsetted here
	var positions = _.map(serie, function (point) {

		var mgr = {
			x: utils.mgr(point.x),
			y: utils.mgr(point.y)
		};

		var offx = utils.isNil(point.offset.x) ? 0 : point.offset.x;
		var offy = utils.isNil(point.offset.y) ? 0 : point.offset.y;

		var out = {
			x: mgr.x.add(point.x, offx),
			y: mgr.y.add(point.y, offy),
			drop: {
				x: utils.isNil(point.drop.x) ? null : mgr.x.add(point.drop.x, offx),
				y: utils.isNil(point.drop.y) ? null : mgr.y.add(point.drop.y, offy)
			},
			span: point.span
		};

		for (var aa in point) {
			switch (aa) {
				case 'x':
				case 'y':
				case 'drop':
				case 'span':
				case 'offset':
					continue;
				default:
					out[aa] = point[aa];
			}
		}

		return out;
	});

	var lineProps = props.onlyMarks ? { show: false } : graphVM[gtype](positions, props, ds);

	// 3 - points
	// we extend positions with any precisions done by the user,

	// first shader
	if (!utils.isNil(props.shader)) {
		shader(props.shader, positions);
	}

	// then explicit, takes precedence
	_.each(positions, function (pos, idx) {
		for (var u in data.series[idx]) {
			switch (u) {
				case 'x':
				case 'y':
				case 'drop':
				case 'span':
					continue;
				default:
					pos[u] = data.series[idx][u];
			}
		}
	});

	var isBar = function isBar(type) {
		return type.search('Bars') >= 0 || type.search('bars') >= 0;
	};

	var graphKey = gtype + '.' + idx;
	var mtype = isBar(gtype) ? 'bar' : props.markType || 'dot';
	var mprops = props.mark ? _.map(positions, function (pos, idx) {
		var markKey = graphKey + '.' + mtype[0] + '.' + idx;
		return marksVM[mtype](pos, props, ds, markKey, pinMgr(pos, props.tag, ds));
	}) : [];

	return {
		key: graphKey,
		type: gtype,
		path: lineProps,
		markType: mtype,
		marks: mprops
	};
};

var axis = function axis(props, state, axe, dir) {

	var partnerAxe = axe === 'abs' ? 'ord' : 'abs';
	var othdir = dir === 'x' ? 'y' : 'x';

	// for every abscissa
	var out = _.map(state.spaces[dir], function (ds, key) {

		if (utils.isNil(ds)) {
			return null;
		}

		var find = function find(key) {
			switch (key) {
				case 'top':
				case 'right':
					return 'max';
				default:
					return 'min';
			}
		};

		var axisKey = axe + '.' + key;

		var axisProps = _.findWhere(props.axisProps[axe], { placement: key });
		axisProps.CS = props.axisProps.CS;

		var partnerAxis = props.axisProps[partnerAxe][axisProps.partner];
		var partnerDs = state.spaces[othdir][partnerAxis.placement];

		var DS = {};
		DS[dir] = ds;
		DS[othdir] = partnerDs;
		var mgr = utils.mgr(partnerDs.d.max);
		var partner = {
			pos: partnerDs.d[find(key)],
			length: mgr.distance(partnerDs.d.max, partnerDs.d.min)
		};
		var bounds = { min: ds.d.min, max: ds.d.max };

		return {
			show: axisProps.show,
			key: axisKey,
			axisLine: axisLine.VM(ds, axisProps, partnerDs, dir),
			ticks: ticks.VM(DS, partner, bounds, dir, axisProps, axisProps.factor, axisKey)
		};
	});

	return _.reject(out, function (val) {
		return utils.isNil(val);
	});
};

var m = {};

m.abscissas = function (props, state) {
	return axis(props, state, 'abs', 'x');
};

m.ordinates = function (props, state) {
	return axis(props, state, 'ord', 'y');
};

m.curves = function (props, state) {
	return _.map(state.series, function (serie, idx) {
		return curve(state.spaces, serie, props.data[idx], props.graphProps[idx], idx);
	});
};

module.exports = m;

},{"21":21,"22":22,"24":24,"35":35,"42":42,"44":44,"45":45,"46":46,"52":52,"53":53,"54":54,"55":55,"8":8}],24:[function(require,module,exports){
'use strict';

var _ = require(8);
var utils = require(35);

var palette = ["#3A83F1", "#DC3FF1", "#F2693F", "#8AF23F", "#758d99", "#F1DC41", "#AC310C", "#40C8F2", "#980DAB", "#F6799B", "#9679F6", "#EE2038", "#00994D", "#758D99", "#F141AD", "#0C86AC", "#C729C7", "#D26F13", "#092508", "#FFBACD", "#7CB603", "#4088EC", "#46002C", "#FF5478", "#43859E", "#72680F", "#97E6EC", "#F777BE", "#AE241F", "#35457B", "#CCA9EF", "#4A0202", "#DDDF14", "#870062", "#B573F2", "#08B83C", "#F59288", "#056EFC", "#2D1B19", "#3AA676", "#2E5045", "#AFE9AA", "#F3D6C2", "#69F393", "#BFFA57", "#FA2C4B", "#355801", "#258B85", "#845100", "#14546B", "#034A29", "#B81288", "#F64BB2", "#D1C2EC", "#83A3F0", "#FEBCA3", "#362463", "#FDB2EA", "#FD981F", "#49F9DF", "#2490C0", "#282807", "#26C186", "#8D54CE", "#6D1662", "#57F2BD"];

var shader = {};
shader.color = function (options, f) {

	var toRGB = function toRGB(str, w) {
		return {
			R: Math.round(parseInt(str.substr(1, 2), 16) * w),
			G: Math.round(parseInt(str.substr(3, 2), 16) * w),
			B: Math.round(parseInt(str.substr(5, 2), 16) * w)
		};
	};

	var addRGB = function addRGB() {
		return {
			R: _.reduce(arguments, function (memo, ar) {
				return memo + ar.R;
			}, 0),
			G: _.reduce(arguments, function (memo, ar) {
				return memo + ar.G;
			}, 0),
			B: _.reduce(arguments, function (memo, ar) {
				return memo + ar.B;
			}, 0)
		};
	};

	var toString = function toString(rgb) {
		return '#' + (rgb.R.toString(16) + rgb.G.toString(16) + rgb.B.toString(16)).toUpperCase();
	};

	var coord = utils.isArray(f) ? f : [f, 1 - f];
	return toString(_.reduce(options.colors, function (memo, col, idx) {
		return addRGB(memo, toRGB(col, coord[idx]));
	}, { R: 0, G: 0, B: 0 }));
};

shader.shade = function (options, f) {
	var val = f;
	if (!!options.shadings && options.shadings.length >= 2) {
		val = options.shadings[0] + (options.shadings[1] - options.shadings[0]) * f;
	}
	return val;
};

var compute = function compute(mgr) {
	switch (mgr.computation) {
		case 'by index':
			return shader[mgr.type](mgr.options, mgr.index / mgr.N);
		case 'explicit':
			return shader[mgr.type](mgr.options, mgr.factor[mgr.index]);
		case 'by function':
			return !!mgr.shadeFunction ? mgr.shadeFunction(mgr.point) : 'black';
	}
};

// 
var fun = function fun(shade, points) {

	if (utils.isNil(shade)) {
		return;
	}

	if (utils.isNil(points) && typeof shade === 'number') {
		return palette[shade];
	}

	var mgr = _.extend({}, shade);
	mgr.N = points.length - 1;
	for (var i = 0; i < points.length; i++) {
		mgr.index = i;
		mgr.point = points[i];
		points[i][shade.type] = compute(mgr);
	}
};

module.exports = fun;

},{"35":35,"8":8}],25:[function(require,module,exports){
'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
	return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
	return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var moment = require(7);
var _ = require(8);
var im = {
	isImm: function isImm(p) {
		return (typeof p === 'undefined' ? 'undefined' : _typeof(p)) === 'object' ? Object.isFrozen(p) : true;
	}
};

var pow = Math.pow;
var floor = Math.floor;
var log = Math.log;
var min = Math.min;
var max = Math.max;
var abs = Math.abs;
var LN10 = Math.LN10;

// period = {
//	years : ,
//	months : ,
//	weeks : ,
//	days : ,
//  total: *nb days*
// }
var processPeriod = function processPeriod(period) {

	if (im.isImm(period)) {
		return period;
	}

	if (typeof period === 'number') {
		// ms
		period = makePeriod(moment.duration(period));
	}

	for (var t in { years: true, months: true, weeks: true, days: true }) {
		if (period[t] === null || period[t] === undefined) {
			period[t] = 0;
		}
	}
	if (period.total === null || period.total === undefined) {
		period.total = moment.duration(period).asDays();
	}

	if (period.total > 15 && !period.offset) {
		period.offset = true;
	}

	return period;
};

var makePeriod = function makePeriod(msOrDur) {
	var dur = !!msOrDur.years ? msOrDur : moment.duration(msOrDur);
	return {
		years: dur.years(),
		months: dur.months(),
		weeks: dur.weeks(),
		days: dur.days() - 7 * dur.weeks(),
		total: dur.asDays()
	};
};

var fetchFormat = function fetchFormat(p) {
	p = processPeriod(p);
	if (p.years !== 0) {
		return {
			string: 'YYYY',
			pref: ''
		};
	} else if (p.months >= 6) {
		return {
			string: 'S/YY', // ce format n'existe pas, il est géré par la fonction qui appelle
			pref: 'S'
		};
	} else if (p.months >= 3) {
		return {
			string: 'Q/YY',
			pref: 'T'
		};
	} else if (p.months !== 0) {
		return {
			string: 'MM/YY',
			pref: ''
		};
	} else if (p.weeks !== 0) {
		return {
			string: 'DD/MM/YY',
			pref: ''
		};
	} else {
		return {
			string: 'DD/MM/YY',
			pref: ''
		};
	}
};

var roundDownPeriod = function roundDownPeriod(p) {

	var make = function make(lab, val) {
		return {
			label: lab,
			val: val
		};
	};

	var out = {};
	if (p.years > 2) {
		out = make('years', max(floor(p.years) / 10, 1));
	} else if (p.total >= moment.duration({ months: 6 }).asDays()) {
		out = make('months', 6);
	} else if (p.total >= moment.duration({ months: 3 }).asDays()) {
		out = make('months', 3);
	} else if (p.total >= moment.duration({ months: 1 }).asDays()) {
		out = make('months', 1);
	} else if (p.total >= moment.duration({ weeks: 2 }).asDays()) {
		out = make('weeks', 2);
	} else if (p.total >= moment.duration({ weeks: 1 }).asDays()) {
		out = make('weeks', 1);
	} else {
		out = make('days', 1);
	}

	return out;
};

var roundUpPeriod = function roundUpPeriod(p) {

	var make = function make(lab, val) {
		return {
			label: lab,
			val: val
		};
	};

	var out = {};
	if (p.years !== 0) {
		out = make('years', floor(p.years) + 1);
	} else if (p.months >= 6) {
		out = make('years', 1);
	} else if (p.months >= 3) {
		out = make('months', 6);
	} else if (p.months >= 1) {
		out = make('months', 3);
	} else if (p.weeks >= 2) {
		out = make('months', 1);
	} else if (p.weeks >= 1) {
		out = make('weeks', 2);
	} else if (p.days >= 1) {
		out = make('weeks', 1);
	} else {
		out = make('days', 1);
	}

	return out;
};

// round period of sale order of magnitude
// down by default
var roundPeriod = function roundPeriod(per, type) {

	var p = {
		years: per.years,
		months: per.months,
		weeks: per.weeks,
		days: per.days,
		total: per.total
	};

	type = type || 'down';

	var types = ['years', 'months', 'weeks', 'days'];

	var makeThis = function makeThis(type, n) {
		for (var t = 0; t < types.length; t++) {
			if (type === types[t]) {
				continue;
			}
			p[types[t]] = 0;
		}
		p[type] = n;
	};

	// 1/10 of years or 1
	// 6, 3 or 1 month(s)
	// 2 or 1 week(s)
	// 1 day
	var round = type === 'up' ? roundUpPeriod(p) : roundDownPeriod(p);
	makeThis(round.label, round.val);

	p.total = moment.duration(p).asDays();

	return p;
};

var closestUp = function closestUp(date, per) {
	var out = closestDown(date, per);
	while (out.getTime() <= date.getTime()) {
		out = m.add(out, per);
	}

	return out;
};

// beginning of period
var closestDown = function closestDown(date, per) {
	// day
	if (per.days !== 0) {
		return moment(date).subtract(per.days, 'days').startOf('day').toDate();
	}
	// start of week: Sunday
	if (per.weeks !== 0) {
		return moment(date).subtract(per.weeks, 'weeks').startOf("week").toDate();
	}
	// start of month
	if (per.months !== 0) {
		var month = 0;
		while (month < date.getMonth()) {
			month += per.months;
		}
		month -= per.months;
		return new Date(date.getFullYear(), month, 1);
	}
	// start of year
	if (per.years !== 0) {
		return new Date(date.getFullYear(), 0, 1);
	}
};

var sameDoP = function sameDoP(dop1, dop2) {
	var b1 = dop1 instanceof Date;
	var b2 = dop2 instanceof Date;
	if (b1 !== b2) {
		return null;
	}

	return b1 ? 'date' : 'period';
};

var dateGT = function dateGT(d1, d2) {
	return d1.getTime() > d2.getTime();
};

var dateLT = function dateLT(d1, d2) {
	return d1.getTime() < d2.getTime();
};

var dateEQ = function dateEQ(d1, d2) {
	return d1.getTime() === d2.getTime();
};

var periodGT = function periodGT(p1, p2) {
	return p1.total > p2.total;
};

var periodLT = function periodLT(p1, p2) {
	return p1.total < p2.total;
};

var periodEQ = function periodEQ(p1, p2) {
	return p1.total === p2.total;
};

var greaterThan = function greaterThan(v1, v2, type) {
	return type === 'date' ? dateGT(v1, v2) : periodGT(v1, v2);
};

var lowerThan = function lowerThan(v1, v2, type) {
	return type === 'date' ? dateLT(v1, v2) : periodLT(v1, v2);
};

var equal = function equal(v1, v2, type) {
	return type === 'date' ? dateEQ(v1, v2) : periodEQ(v1, v2);
};

var addPer = function addPer(p1, p2) {
	p1 = processPeriod(p1);
	return makePeriod(moment.duration(p1).add(moment.duration(p2)));
};

var subPer = function subPer(p1, p2) {
	p1 = processPeriod(p1);
	return makePeriod(moment.duration(p1).subtract(moment.duration(p2)));
};

var m = {};

// date / distance methods
m.orderMag = function (dop) {
	var ms = dop instanceof Date ? dop.getTime() : moment.duration({ days: processPeriod(dop).total }).asMilliseconds();

	return floor(log(ms) / LN10);
};

m.orderMagValue = function (last, first) {
	// start of next year
	var nextfst = new Date(first.getFullYear() + 1, 0, 1);
	if (m.lowerThan(nextfst, last)) {
		return nextfst;
	}

	// start of next semester 
	if (first.getMonth() < 7) {
		nextfst = new Date(first.getFullYear(), 7, 1);
		if (m.lowerThan(nextfst, last)) {
			return nextfst;
		}
	}

	// start of next trimester
	var mm = first.getMonth() + 3 - first.getMonth() % 3;
	nextfst = new Date(first.getFullYear(), mm, 1);
	if (m.lowerThan(nextfst, last)) {
		return nextfst;
	}

	// start of next month
	nextfst = new Date(first.getFullYear(), first.getMonth() + 1, 1);
	if (m.lowerThan(nextfst, last)) {
		return nextfst;
	}

	// start of next half-month
	if (first.getDate() < 15) {
		nextfst = new Date(first.getFullYear(), first.getMonth(), 15);
		if (m.lowerThan(nextfst, last)) {
			return nextfst;
		}
	}

	// start of next quarter-month (as 7 days)
	var dd = first.getDate() + 7 - first.getDate() % 7;
	nextfst = new Date(first.getFullYear(), first.getMonth(), dd);
	if (m.lowerThan(nextfst, last)) {
		return nextfst;
	}

	// next day
	return new Date(first.getFullYear(), first.getMonth(), first.getDate() + 1);
};

m.orderMagDist = function (r) {
	return makePeriod(pow(10, m.orderMag(r)));
};

m.roundUp = function (p) {
	return roundPeriod(p, 'up');
};

m.roundDown = function (p) {
	return roundPeriod(p, 'down');
};

m.multiply = function (p, f) {
	return makePeriod(moment.duration({ days: processPeriod(p).total * f }));
};

m.divide = function (p, f) {
	return makePeriod(moment.duration({ days: processPeriod(p).total / f }));
};

m.increase = function (p1, p2) {
	return makePeriod(moment.duration({ days: processPeriod(p1).total + processPeriod(p2).total }));
};

m.offset = function (p) {
	p = processPeriod(p);

	var offsetMe = function offsetMe(per) {
		if (per.years !== 0) {
			return makePeriod(moment.duration({ months: 6 }));
		} else {
			return m.divide(p, 2);
		}
	};

	return p.offset ? offsetMe(p) : makePeriod(0);
};

// date methods
m.closestRoundUp = function (ref, per) {
	return closestUp(ref, roundPeriod(per));
};

m.closestRoundDown = function (ref, per) {
	return closestDown(ref, roundPeriod(per));
};

m.closestRound = function (ref, om, type) {
	return type === 'up' ? m.closestRoundUp(ref, om) : m.closestRoundDown(ref, om);
};

m.min = function (dates) {
	return new Date(min.apply(null, _.map(dates, function (date) {
		return date.getTime();
	})));
};

m.max = function (dates) {
	return new Date(max.apply(null, _.map(dates, function (date) {
		return date.getTime();
	})));
};

m.label = function (date, period) {
	var format = fetchFormat(period);
	var out = '';
	if (format.pref === 'S') {
		out = date.getMonth() > 5 ? '2/' : '1/';
		out += moment(date).format('YY');
	} else {
		out = moment(date).format(format.string);
	}
	return format.pref + out;
};

// date & period methods
m.add = function (dop, p) {
	// preprocess period
	p = processPeriod(p);

	return dop instanceof Date ? moment(dop).add(p.years, 'years').add(p.months, 'months').add(p.weeks, 'weeks').add(p.days, 'days').toDate() : addPer(dop, p);
};

m.subtract = function (dop, p) {
	// preprocess period
	p = processPeriod(p);

	return dop instanceof Date ? moment(dop).subtract(p.years, 'years').subtract(p.months, 'months').subtract(p.weeks, 'weeks').subtract(p.days, 'days').toDate() : subPer(dop, p);
};

m.distance = function (d1, d2) {
	return makePeriod(abs(d1.getTime() - d2.getTime()));
};

m.greaterThan = function (dop1, dop2) {
	var sd = sameDoP(dop1, dop2);
	if (sd === null) {
		throw 'Error in dateMgr: trying to compare a Date with a Period';
	}
	return greaterThan(dop1, dop2, sd);
};

m.lowerThan = function (dop1, dop2) {
	var sd = sameDoP(dop1, dop2);
	if (sd === null) {
		throw 'Error in dateMgr: trying to compare a Date with a Period';
	}
	return lowerThan(dop1, dop2, sd);
};

m.equal = function (dop1, dop2) {
	var sd = sameDoP(dop1, dop2);
	if (sd === null) {
		throw 'Error in dateMgr: trying to compare a Date with a Period';
	}
	return equal(dop1, dop2, sd);
};

// managements
m.getValue = function (dop) {
	return dop instanceof Date ? dop.getTime() : moment.duration(dop).asMilliseconds();
};

m.extraTicks = function (step, start, end, already) {
	var out = [];
	var startYear = start.getFullYear();
	var lastYear = end.getFullYear();
	// every year, whatever happens
	for (var ye = startYear; ye <= lastYear; ye++) {
		var dat = new Date(ye, 0, 1);
		var idx = _.findIndex(already, function (a) {
			return m.equal(a.position, dat);
		});
		if (idx !== -1) {
			already[idx].grid = {};
			already[idx].grid.show = true;
			continue;
		}
		if (m.lowerThan(start, dat) && m.lowerThan(dat, end)) {
			out.push({
				position: dat,
				offset: {
					along: 0,
					perp: 0
				},
				label: '',
				show: false,
				extra: true,
				grid: {
					show: true,
					color: 'LightGray',
					width: 0.5
				}
			});
		}
	}
	return out;
};

m.smallestStep = function () {
	return makePeriod(moment.duration({ days: 1 }));
};

m.makePeriod = function (per) {
	return processPeriod(per);
};

// in years
m.value = function (num) {
	return new Date(num * 1000 * 3600 * 24 * 365);
};

// in years
m.step = function (num) {
	return makePeriod({ years: num });
};

m.labelF = 0.75;

m.type = 'date';

module.exports = m;

},{"7":7,"8":8}],26:[function(require,module,exports){
'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
	return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
	return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var utils = require(35);
var im = require(1);

var deepEqual = function deepEqual(obj1, obj2) {
	if ((typeof obj1 === 'undefined' ? 'undefined' : _typeof(obj1)) === 'object') {
		if (!obj2 || (typeof obj2 === 'undefined' ? 'undefined' : _typeof(obj2)) !== 'object') {
			return false;
		}
		if (obj1 instanceof Date) {
			return obj2 instanceof Date ? obj1.getTime() === obj2.getTime() : false;
		} else {
			for (var t in obj1) {
				if (!deepEqual(obj1[t], obj2[t])) {
					return false;
				}
			}
			for (var u in obj2) {
				if (obj1[u] === null || obj1[u] === undefined) {
					return false;
				}
			}
		}
	} else {
		return obj1 === obj2;
	}
	return true;
};

var noFreeze = function noFreeze(obj) {
	return {
		object: obj,
		get: function get() {
			obj = utils.deepCp({}, obj);return obj;
		}
	};
};

var m = {};

m.mergeDeep = function (src, tgt) {
	return utils.deepCp(tgt, src);
};

m.isImm = function (obj) {
	return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || Object.isFrozen(obj);
};

m.immutable = function (obj) {
	return m.isImm(obj) ? obj : im.fromJS(obj);
};

m.freeze = function (obj, type) {
	return type === 'no' ? noFreeze(obj) : new im(obj);
};

m.isEqual = function (obj1, obj2) {

	var immut1 = m.isImm(obj1);
	var immut2 = m.isImm(obj2);
	return immut1 === immut2 ? immut1 ? obj1 === obj2 : deepEqual(obj1, obj2) : false;
};

module.exports = m;

},{"1":1,"35":35}],27:[function(require,module,exports){
'use strict';

var React = require("react");
var _ = require(8);

var iconer = require(47);
var color = require(24);

var process = function process(props) {

	var icW = props.legend.iconWidth + props.legend.iconUnit;
	var icH = props.legend.iconHeight + props.legend.iconUnit;

	// for icon, just to help reading
	var icw = props.legend.iconWidth - 2 * props.legend.iconHMargin;
	var ich = props.legend.iconHeight - 2 * props.legend.iconVMargin;
	var ichm = props.legend.iconHMargin;
	var icvm = props.legend.iconVMargin;

	var getALegend = function getALegend(data, gprops, idx) {
		var icc = gprops.color;
		var sha = gprops.shader;
		if (!!sha && !!sha.options) {
			sha.computation = sha.computation === 'by function' ? sha.computation : 'explicit';
			sha.type = 'color';
			sha.factor = [0.5];
			var col = {};
			color(sha, [col]);
			icc = col.color;
		}
		var ics = gprops.width < 2 ? gprops.width * 1.5 : gprops.width; // slightly more bold, if needed
		var iconProps = {
			color: icc,
			width: icw,
			height: ich,
			hMargin: ichm,
			vMargin: icvm,
			strokeWidth: ics
		};
		var perPoint = [];
		if (data.series) {
			for (var p = 0; p < data.series.length; p++) {
				if (!!data.series[p].legend) {
					var point = data.series[p];
					var typeMark = gprops.markType;
					iconProps.color = point.color || color(p);
					perPoint.push({
						icon: React.createElement('svg', { width: icW, height: icH }, iconer.icon(iconProps, typeMark)),
						label: point.legend || 'data #' + idx
					});
				}
			}
		}

		return perPoint.length !== 0 ? perPoint : {
			icon: React.createElement('svg', { width: icW, height: icH }, gprops.onlyMarks ? null : iconer.icon(iconProps, 'line'), gprops.mark ? iconer.icon(iconProps, gprops.markType) : null),
			label: gprops.name || 'graph #' + idx
		};
	};

	var leg = [];
	for (var i = 0; i < props.data.length; i++) {
		leg.push(getALegend(props.data[i], props.graphProps[i], i));
	}

	return _.flatten(leg);
};

module.exports = process;

},{"24":24,"47":47,"8":8,"react":"react"}],28:[function(require,module,exports){
"use strict";

/////////////////////
/// misc
///////////////////

var relEps = 1e-16;

var misc = {};

// a < b
misc.lowerThan = function (a, b) {
	return a - b < -relEps;
};

// a < b
misc.greaterThan = function (a, b) {
	return a - b > relEps;
};

// a <= b
misc.lowerEqualThan = function (a, b) {
	return a - b < relEps;
};

// a <= b
misc.greaterEqualThan = function (a, b) {
	return a - b > -relEps;
};

// a === b
misc.equalTo = function (a, b, coef) {
	coef = coef || 1;
	return Math.abs(a - b) < coef * relEps;
};

// a !== b
misc.notEqualTo = function (a, b, coef) {
	coef = coef || 1;
	return Math.abs(a - b) > coef * relEps;
};

misc.isZero = function (a, coef) {
	coef = coef || 1;
	return Math.abs(a) < coef * relEps;
};

var m = {};

m.misc = misc;

module.exports = m;

},{}],29:[function(require,module,exports){
'use strict';

var pow = Math.pow,
    floor = Math.floor,
    log = Math.log,
    min = Math.min,
    max = Math.max,
    abs = Math.abs,
    LN10 = Math.LN10;

var m = {};

var firstDigit = function firstDigit(r) {
	var res = r * pow(10, -m.orderMag(r));
	var str = '' + res;
	var out = str[0] || 0;
	return Number(out);
};

var roundMe = function roundMe(min, max) {
	var valOrder = m.orderMag(max);
	var distOrd = m.orderMag(m.distance(max, min));

	var valid = function valid(cand) {
		return cand >= min && cand <= max;
	};

	var val = firstDigit(max) * pow(10, valOrder);
	if (!valid(val)) {
		if (distOrd < valOrder) {
			var step = pow(10, distOrd);
			return floor(min / step) * step + step;
		} else {
			// distOrd === valOrder
			return min;
		}
	}
	return val;
};

// distance methods
m.orderMag = function (r) {
	if (r < 0) {
		r = -r;
	}
	return r === 0 ? 0 : floor(log(r) / LN10);
};

m.orderMagValue = m.orderMagDist = function (max, min) {

	// zero case treated right away
	if (min * max < 0) {
		return 0;
	}
	var absMin = max < 0 ? Math.abs(max) : min;
	var absMax = max < 0 ? Math.abs(min) : max;
	var fac = max < 0 ? -1 : 1;
	return fac * roundMe(absMin, absMax);
};

m.roundUp = function (r) {
	var step = function step(val) {
		switch (firstDigit(val)) {
			case 2:
				return 5 * pow(10, m.orderMag(cand));
			default:
				return 2 * cand;
		}
	};
	var cand = pow(10, m.orderMag(r));
	while (cand <= r) {
		cand = step(cand);
	}

	var test = cand * pow(10, -m.orderMag(cand)); // between 0 and 1
	if (test > 6) {
		cand = pow(10, m.orderMag(cand) + 1);
	}
	return cand;
};

m.roundDown = function (r) {
	var step = 5 * pow(10, m.orderMag(r) - 1);
	var cand = firstDigit(r) * pow(10, m.orderMag(r));
	while (cand >= r) {
		cand -= step;
	}
	return cand;
};

m.multiply = function (d, f) {
	return d * f;
};

m.divide = function (d, f) {
	return d / f;
};

m.increase = function (d1, d2) {
	return d1 + d2;
};

m.offset = function () /*d*/{
	return 0;
};

// value methods
m.closestRoundUp = function (ref, dist) {

	if (ref < 0) {
		return -m.closestRoundDown(-ref, dist);
	}

	var refOm = m.orderMag(ref);
	var start = pow(10, refOm) * firstDigit(ref);
	while (start <= ref) {
		start += dist;
	}
	return start;
};

m.closestRoundDown = function (ref, dist) {

	var om = m.orderMag(dist);

	if (ref < 0) {
		return -m.closestRoundUp(-ref, om);
	}

	var refOm = m.orderMag(ref);
	var start = pow(10, refOm) * firstDigit(ref);
	if (refOm !== om) {
		while (start < ref) {
			start += dist;
		}
	}

	while (start >= ref) {
		start -= dist;
	}

	return start;
};

m.closestRound = function (ref, om, type) {
	return type === 'up' ? m.closestRoundUp(ref, om) : m.closestRoundDown(ref, om);
};

m.min = function (values) {
	return min.apply(null, values);
};

m.max = function (values) {
	return max.apply(null, values);
};

m.label = function (value, useless, fac) {
	var out = (value / fac).toFixed(1);
	return out;
};

// value & distance methods
m.add = function (d1, d2) {
	return d1 + d2;
};

m.subtract = function (d1, d2) {
	return d1 - d2;
};

m.distance = function (d1, d2) {
	return abs(d1 - d2);
};

m.greaterThan = function (v1, v2) {
	return v1 > v2;
};

m.lowerThan = function (v1, v2) {
	return v1 < v2;
};

m.equal = function (v1, v2) {
	return v1 === v2;
};

// some management

m.extraTicks = function () {
	return [];
};

m.getValue = m.value = m.step = function (v) {
	return v;
};

m.smallestStep = function () {
	return 1;
};

m.labelF = 0.75;

m.type = 'number';

module.exports = m;

},{}],30:[function(require,module,exports){
'use strict';

var _ = require(8);
var space = require(32);
var utils = require(35);
var gProps = require(31);
var vm = require(23);
var im = require(26);
var legender = require(27);

var defaultTheProps = function defaultTheProps(props) {

	// axisProps is an Array, 
	// can be given as a non array
	// empty <==> ticks.major.show === false && ticks.minor.show === false
	if (!!props.axisProps) {
		for (var u in props.axisProps) {
			if (!Array.isArray(props.axisProps[u])) {
				props.axisProps[u] = [props.axisProps[u]];
			}
			for (var ax = 0; ax < props.axisProps[u].length; ax++) {
				var axe = props.axisProps[u][ax]; // too long
				if (axe.empty) {
					if (!axe.ticks) {
						axe.ticks = {};
					}
					if (!axe.ticks.major) {
						axe.ticks.major = {};
					}
					if (!axe.ticks.minor) {
						axe.ticks.minor = {};
					}
					axe.ticks.major.show = false;
					axe.ticks.minor.show = false;
				} else {
					// no major ticks
					if (!!axe.ticks && !!axe.ticks.major && axe.ticks.major.show === false) {
						// no minor ticks
						if (!axe.ticks.minor || axe.ticks.minor.show !== true) {
							axe.empty = true;
						}
					}
				}
			}
		}
	}

	// axis depends on data,
	// where are they?
	var axis = {
		abs: _.uniq(_.map(_.pluck(props.data, 'abs'), function (e) {
			return utils.isNil(e) ? 'bottom' : e.axis || 'bottom';
		})),
		ord: _.uniq(_.map(_.pluck(props.data, 'ord'), function (e) {
			return utils.isNil(e) ? 'left' : e.axis || 'left';
		}))
	};

	// empty graph
	if (axis.abs.length === 0) {
		axis.abs.push('bottom');
	}
	if (axis.ord.length === 0) {
		axis.ord.push('left');
	}

	// fill by default
	var fullprops = utils.deepCp(utils.deepCp({}, gProps.Graph(axis)), props);

	// default for pie !!!bad coding!!!, Pie should do it (how?)
	var noMark = function noMark(idx) {
		fullprops.graphProps[idx].markType = 'pie';
		fullprops.graphProps[idx].mark = false;
	};

	if (!!_.find(props.data, function (data) {
		return data.type === 'Pie';
	})) {
		_.each(fullprops.axisProps.abs, function (ax) {
			ax.show = false;
		});
		_.each(fullprops.axisProps.ord, function (ax) {
			ax.show = false;
		});
		_.each(props.data, function (d, idx) {
			return d.type === 'Pie' ? noMark(idx) : null;
		});
	}

	// data & graphProps
	var data = gProps.defaults('data');
	for (var ng = 0; ng < fullprops.data.length; ng++) {
		var gprops = gProps.defaults(props.data[ng].type || 'Plain');
		fullprops.data[ng] = utils.deepCp(utils.deepCp({}, data), props.data[ng]);
		fullprops.graphProps[ng] = utils.deepCp(utils.deepCp({}, gprops), props.graphProps[ng]);
	}

	return fullprops;
};

var addDefaultDrop = function addDefaultDrop(serie, dir, ds, after) {

	var fetchDs = function fetchDs(d) {
		return !!ds[d].bottom ? ds[d].bottom : !!ds[d].top ? ds[d].top : !!ds[d].left ? ds[d].left : !!ds[d].right ? ds[d].right : null;
	};

	var defZero = function defZero(point) {
		return utils.isDate(point[dir]) ? new Date(0) : 0;
	};

	var def = function def(point, locdir) {
		var min = !!ds ? fetchDs(locdir).d.min : defZero(point);
		var raw = point;
		raw.drop[locdir] = utils.isNil(raw.drop[locdir]) ? min : raw.drop[locdir];

		return raw;
	};

	// if dir is specified, only this dir, if not, both
	return _.map(serie, function (point) {
		return !!dir ? def(point, dir) : after ? def(def(point, 'x'), 'y') : point;
	});
};

var copySerie = function copySerie(serie) {

	return _.map(serie, function (point, idx) {
		var xstr = utils.isString(point.x);
		var ystr = utils.isString(point.y);
		var raw = {
			x: xstr ? idx : point.x,
			y: ystr ? idx : point.y,
			label: {
				x: xstr ? point.x : !!point.label && point.label.x ? point.label.x : undefined,
				y: ystr ? point.y : !!point.label && point.label.y ? point.label.y : undefined
			},
			drop: {
				x: ystr ? 0 : undefined,
				y: xstr ? 0 : undefined
			},
			tag: !utils.isNil(point.value) ? point.value + '' : // explicitely defined
			xstr ? xstr : ystr ? ystr : // it's a label
			'(' + point.x + ',' + point.y + ')' // the (x,y) coordinates
		};
		for (var u in point) {
			if (u !== 'x' && u !== 'y' && u !== 'label') {
				raw[u] = point[u];
			}
		}
		return raw;
	});
};

var validate = function validate(series, discard) {

	for (var se = 0; se < series.length; se++) {
		if (utils.isNil(series[se])) {
			series[se] = [];
		}
		for (var p = 0; p < series[se].length; p++) {
			var px = utils.isValidNumber(series[se][p].x);
			var py = utils.isValidNumber(series[se][p].y);
			var pv = utils.isValidNumber(series[se][p].value);
			if (!pv && (!utils.isValidParam(px) || !utils.isValidParam(py))) {
				if (!discard) {
					return false;
				}
				series[se].splice(p, 1);
				p--;
			}
		}
	}

	return true;
};

var addOffset = function addOffset(series, stacked) {
	var xoffset = [];
	var yoffset = [];

	var span = function span(ser, idx) {
		return ser.length > 1 ? idx === 0 ? Math.abs(ser[idx + 1] - ser[idx]) * 0.9 : // if first
		idx === ser.length - 1 ? Math.abs(ser[idx] - ser[idx - 1]) * 0.9 : // if last
		Math.min(Math.abs(ser[idx] - ser[idx - 1]), Math.abs(ser[idx + 1] - ser[idx])) * 0.9 : // if in between
		0;
	}; // if no serie

	var ensure = function ensure(obj, prop) {
		return !!obj[prop] ? null : obj[prop] = {};
	};
	var writeIfUndef = function writeIfUndef(obj, prop, val) {
		return !!obj[prop] ? null : obj[prop] = val;
	};

	for (var i = 0; i < series.length; i++) {

		_.each(series[i], function (point) {
			if (utils.isNil(point.offset)) {
				point.offset = {};
			}
			point.offset.x = point.offset.x || undefined;
			point.offset.y = point.offset.y || undefined;
		});

		if (stacked[i]) {
			// stacked in direction 'stacked', 'x' and 'y' are accepted
			switch (stacked[i]) {
				case 'x':
					// init xoffset
					if (xoffset.length === 0) {
						xoffset = _.map(series[i], function () /*point*/{
							return 0;
						});
					} else {
						if (xoffset.length !== series[i].length) {
							throw new Error('Stacked data needs to be of same size (x dir)!!');
						}
					}
					// add, compute and update
					for (var j = 0; j < xoffset.length; j++) {
						series[i][j].offset.x = xoffset[j];
						ensure(series[i][j], 'drop');
						series[i][j].drop.x = 0;
						ensure(series[i][j], 'span');
						writeIfUndef(series[i][j].span, 'y', span(_.pluck(series[i], 'y'), j));
						xoffset[j] += series[i][j].x;
					}
					break;
				case 'y':
					// init yoffset
					if (yoffset.length === 0) {
						yoffset = _.map(series[i], function () /*point*/{
							return 0;
						});
					} else {
						if (yoffset.length !== series[i].length) {
							throw new Error('Stacked data needs to be of same size (y dir)!!');
						}
					}
					// add, compute and update
					for (var k = 0; k < yoffset.length; k++) {
						series[i][k].offset.y = yoffset[k];
						ensure(series[i][k], 'drop');
						series[i][k].drop.y = 0;
						ensure(series[i][k], 'span');
						writeIfUndef(series[i][k].span, 'x', span(_.pluck(series[i], 'x'), k));
						yoffset[k] += series[i][k].y;
					}
					break;
			}
		}
	}
};

var makeSpan = function makeSpan(series, data) {

	var spanSer = function spanSer(barType) {

		var makeOffset = function makeOffset(serie, n, s, sb) {
			if (utils.isNil(serie.Span) || series[s].length === 0) {
				return;
			}
			if (utils.isNil(serie.offset)) {
				serie.offset = {};
			}

			var dir = barType[0] === 'y' ? 'y' : 'x';
			var othdir = dir === 'y' ? 'x' : 'y';

			var mgr = utils.mgr(series[s][0][dir]);
			var othmgr = utils.mgr(series[s][0][othdir]);

			// start[s] = x - span * n / 2 + sb * span => offset = (sb *	span	- span * n / 2 ) = span * (sb - n / 2 )
			serie.offset[dir] = mgr.multiply(serie.span, sb - (n - 1) / 2);
			if (utils.isNil(serie.offset[othdir])) {
				serie.offset[othdir] = othmgr.step(0);
			}
			_.each(series[s], function (point) {
				point.span = point.span || {};
				point.span[dir] = serie.span;
				point.offset = point.offset || {};
				point.offset[dir] = serie.offset[dir];
				point.offset[othdir] = serie.offset[othdir];
			});
		};

		var spanDiv = function spanDiv(serie, n, idx, idxb) {
			if (utils.isNil(serie.Span)) {
				return;
			}
			var mgr = utils.mgr(serie.span);
			serie.span = mgr.divide(serie.span, n);
			makeOffset(serie, n, idx, idxb);
		};

		var n = 0;
		var out = [];
		var oidx = [];
		_.each(series, function (serie, idx) {
			if (data[idx].type === barType) {
				out[idx] = serie.length ? spanify(serie, data[idx]) : {};
				oidx[idx] = n;
				n++;
			}
		});

		_.each(out, function (serie, idx) {
			return serie ? spanDiv(serie, n, idx, oidx[idx]) : null;
		});
	};

	spanSer('Bars');
	spanSer('yBars');

	spanSer('bars');
	spanSer('ybars');
};

var spanify = function spanify(serie, data) {
	var out = {};
	if (utils.isNil(data.span) || data.span === 0) {
		var d;
		var dir = data.type[0] === 'y' ? 'y' : 'x';

		var mgr = utils.mgr(serie[0][dir]);
		for (var i = 1; i < serie.length; i++) {
			var dd = mgr.distance(serie[i][dir], serie[i - 1][dir]);
			if (d === undefined || mgr.lowerThan(dd, d)) {
				d = mgr.multiply(dd, 0.99);
			}
		}
		out.span = d;
	} else {
		out.span = data.span;
	}
	out.Span = true;

	return out;
};

// if stairs, we need an offset
// at one boundary value
var offStairs = function offStairs(serie, gprops) {
	if (serie.length < 2) {
		return undefined;
	}

	if (!gprops.stairs || gprops.stairs === 'right') {
		return serie[serie.length - 1].x - serie[serie.length - 2].x;
	} else if (gprops.stairs === 'left') {
		return serie[0].x - serie[1].x;
	} else {
		return undefined;
	}
	return undefined;
};

var m = {};

m.process = function (rawProps) {

	var props = defaultTheProps(utils.deepCp({}, rawProps));

	var raw = _.pluck(props.data, 'series');

	var state = {};
	var lOffset = [];

	// empty
	if (!validate(raw, props.discard)) {

		state.series = _.map(props.data, function () {
			return (/*ser*/[]
			);
		});
	} else {
		// data depening on serie, geographical data only
		state.series = _.map(raw, function (serie) {
			return copySerie(serie);
		});
		// offset from stacked
		addOffset(state.series, _.map(props.data, function (ser) {
			return ser.stacked;
		}));
		// span and offset from Bars || yBars
		makeSpan(state.series, _.map(props.data, function (ser, idx) {
			return { type: ser.type, span: props.graphProps[idx].span };
		}));
		// offset from Stairs
		lOffset = _.map(props.data, function (p, idx) {
			return p.type === 'Stairs' ? offStairs(state.series[idx], props.graphProps[idx]) : undefined;
		});
	}

	// so we have all the keywords
	var marginalize = function marginalize(mar) {
		for (var m in { left: true, right: true, bottom: true, top: true }) {
			if (!mar[m]) {
				mar[m] = undefined;
			}
		}

		return mar;
	};

	// axis data, min-max from series (computed in space-mgr)
	var abs = utils.isArray(props.axisProps.abs) ? props.axisProps.abs : [props.axisProps.abs];
	var ord = utils.isArray(props.axisProps.ord) ? props.axisProps.ord : [props.axisProps.ord];

	// let's look for labels given in the data
	_.each(props.data, function (dat, idx) {
		var locObDir = { x: 'abs', y: 'ord' };
		var ser = state.series[idx];
		for (var u in locObDir) {
			var dir = locObDir[u];
			var locAxis = _.find(props.axisProps[dir], function (ax) {
				return ax.placement === dat[dir].axis;
			});
			for (var p = 0; p < ser.length; p++) {
				var point = ser[p];
				if (!!point.label[u]) {
					locAxis.tickLabels.push({ coord: point[u], label: point.label[u] });
				}
			}
		}
	});

	var borders = {
		ord: ord,
		abs: abs,
		marginsO: marginalize(props.outerMargin),
		marginsI: marginalize(props.axisMargin)
	};

	// xmin, xmax...
	var obDir = { x: 'abs', y: 'ord' };
	var obMM = { min: true, max: true };
	for (var dir in obDir) {
		for (var type in obMM) {
			var tmp = dir + type; //xmin, xmax, ...
			if (!utils.isNil(props[tmp])) {
				borders[obDir[dir]][0][type] = props[tmp];
			}
		}
	}

	var title = { title: props.title, titleFSize: props.titleFSize };

	// getting dsx and dsy
	var universe = { width: props.width, height: props.height };

	// span and offet pointwise
	// drops if required and not given (default value)
	_.each(state.series, function (serie, idx) {
		var dir;
		switch (props.data[idx].type) {
			case 'Bars':
			case 'bars':
				dir = 'y';
				break;
			case 'yBars':
			case 'ybars':
				dir = 'x';
				break;
			default:
				break;
		}
		addDefaultDrop(serie, dir);
	});

	var data = _.map(state.series, function (ser, idx) {
		return {
			series: ser,
			phantomSeries: props.data[idx].phantomSeries,
			stacked: props.data[idx].stacked,
			abs: props.data[idx].abs,
			ord: props.data[idx].ord,
			limitOffset: !!lOffset[idx] ? lOffset[idx] : undefined
		};
	});

	// empty
	if (data.length === 0) {
		data[0] = {
			series: [{ x: 42, y: 42 }],
			abs: {
				axis: 'bottom',
				type: 'number'
			},
			ord: {
				axis: 'left',
				type: 'number'
			}
		};
	}

	// space = {dsx, dsy}
	state.spaces = space.spaces(data, universe, borders, title);

	// defaut drops for those that don't have them
	state.series = _.map(state.series, function (serie, idx) {
		var dir, ds;
		switch (props.data[idx].type) {
			case 'Bars':
			case 'bars':
				dir = 'y';
				ds = state.spaces;
				break;
			case 'yBars':
			case 'ybars':
				dir = 'x';
				ds = state.spaces;
				break;
			default:
				break;
		}

		if (!!props.data[idx].stacked) {
			dir = props.data[idx].stacked;
		}
		if (!dir && !!props.graphProps[idx].process) {
			dir = !props.graphProps[idx].process.dir || props.graphProps[idx].process.dir === 'x' ? 'y' : 'x';
		}
		return addDefaultDrop(serie, dir, ds, true);
	});

	//now to immutable VM
	var imVM = {
		width: props.width,
		height: props.height,
		axisOnTop: props.axisOnTop
	};

	// 1 - cadre
	imVM.cadre = props.cadre;

	// 2 - background
	imVM.background = {
		color: props.background || 'none',
		spaceX: {
			min: Math.min.apply(null, _.map(state.spaces.x, function (ds) {
				return !!ds ? ds.c.min : 1e6;
			})),
			max: Math.max.apply(null, _.map(state.spaces.x, function (ds) {
				return !!ds ? ds.c.max : -1e6;
			}))
		},
		spaceY: {
			min: Math.min.apply(null, _.map(state.spaces.y, function (ds) {
				return !!ds ? ds.c.min : 1e6;
			})),
			max: Math.max.apply(null, _.map(state.spaces.y, function (ds) {
				return !!ds ? ds.c.max : -1e6;
			}))
		}
	};

	// 3 - foreground
	imVM.foreground = props.foreground || {};
	imVM.foreground.cx = imVM.foreground.cx || 0;
	imVM.foreground.cy = imVM.foreground.cy || 0;
	imVM.foreground.width = imVM.foreground.width || 0;
	imVM.foreground.height = imVM.foreground.height || 0;
	imVM.foreground.ds = {
		x: state.spaces.x.bottom,
		y: state.spaces.y.left
	};

	// 4 - Title
	imVM.title = {
		title: props.title,
		FSize: props.titleFSize,
		width: props.width,
		// as of now, it's not used
		height: props.height,
		placement: 'top'
	};

	// 5 - Axes
	imVM.axes = {
		css: props.css,
		abs: vm.abscissas(props, state),
		ord: vm.ordinates(props, state)
	};

	// 6 - Curves
	imVM.curves = vm.curves(props, state);

	var le = legender(props);
	imVM.legend = function () {
		return le;
	};

	return im.freeze(imVM, props.freeze);
};

m.processLegend = function (rawProps) {
	var props = defaultTheProps(utils.deepCp({}, rawProps));
	// data depening on serie, geographical data only
	props.data = _.map(props.data, function (dat, idx) {
		return {
			type: rawProps.data[idx].type,
			series: copySerie(dat.series)
		};
	});

	return legender(props);
};

module.exports = m;

},{"23":23,"26":26,"27":27,"31":31,"32":32,"35":35,"8":8}],31:[function(require,module,exports){
'use strict';

/*
	all the proprieties
*/

var _ = require(8);
var utils = require(35);

// defaults for marks
var marks = {};

marks.dot = marks.Dot = function () {
	return {
		draw: false,
		ds: {
			x: {},
			y: {}
		},
		position: {
			x: 0,
			y: 0
		},
		radius: 3,
		color: 'black',
		width: 0,
		fill: undefined,
		size: undefined,
		shade: 1
	};
};

marks.square = marks.Square = function () {
	return {
		draw: false,
		ds: {
			x: {},
			y: {}
		},
		position: {
			x: 0,
			y: 0
		},
		color: 'black',
		width: 0,
		fill: undefined,
		size: 0,
		shade: 1
	};
};

marks.bar = marks.Bar = function () {
	return {
		draw: false,
		ds: {
			x: {}, // see space-mgr for details
			y: {}
		}, // see space-mgr for details
		position: {
			x: 0,
			y: 0
		},
		drop: {
			x: null,
			y: 0
		},
		width: 0,
		span: 0.5,
		offset: {
			x: 0,
			y: 0
		},
		shade: 1
	};
};

// defaults for graphs
var graph = {};
graph.common = function () {
	return {
		color: 'black',
		width: 1,
		fill: 'none',
		shade: 1,
		// mark props, explicit at heigh level
		// overwritten if present in markProps
		mark: true,
		markColor: undefined,
		baseLine: { x: undefined, y: 0 },
		dropLine: { x: false, y: false },
		markSize: 3,
		markType: 'dot',
		onlyMarks: false,
		// contains low-level description,
		// i.e. specific things like radius
		// for a dot, or anything.
		markProps: {},
		shader: undefined, //playing with colors
		process: undefined, //playing with data {dir: x || y, type: 'histogram'}
		tag: {
			show: false, // show the tag
			print: function print(t) {
				return t + '';
			},
			fontSize: 10,
			pin: false, // show the pin
			pinColor: 'black', // color of the pin
			pinLength: 10, // 10 px as pin length
			pinAngle: 90, // direction of pin
			pinHook: 3, // 3px for hook
			color: 'black' // color of the tag
		}
	};
};

graph.Bars = graph.bars = function () {

	return _.extend(utils.deepCp({}, graph.common()), {
		color: 'none',
		width: 0,
		dir: {
			x: false,
			y: true
		},
		drop: { x: undefined, y: 0 },
		markType: 'bar',
		markProps: {
			width: 0,
			draw: false
		},
		// Number or {}
		span: undefined, // auto compute
		offset: { x: 0, y: 0 }
	});
};

graph.yBars = graph.ybars = function () {

	return _.extend(utils.deepCp({}, graph.Bars()), {
		dir: {
			x: true,
			y: false
		}
	});
};

graph.Pie = graph.pie = function () {
	return _.extend(utils.deepCp({}, graph.common()), {
		pie: 'disc', // tore
		pieOrigin: { x: 0, y: 0 }, // offset from center
		pieRadius: undefined, // 2/3 of world
		pieToreRadius: 0, // 0: no hole, 1 : no border!
		tag: {
			show: false, // show the tag
			print: function print(t) {
				return t + '';
			},
			pin: false, // show the pin
			pinColor: 'black', // color or the pin
			pinLength: 0.35, // 10 px as pin length
			pinRadius: 0.75, // 3/4 of pie size
			pinHook: 10, // absolute length
			color: 'black' // color of the tag
		}
	});
};

//graph.Bars = graph.common;
graph.Plain = graph.plain = graph.Stairs = graph.stairs = graph.common;

///////////
// major / minor props
/////////////

var m = {};

// that's a major
m.Grid = {
	show: false,
	color: 'LightGray',
	width: 0.5,
	length: 0
};

// that's a major
m.Tick = {
	show: true,
	width: 1,
	length: 15,
	out: 0.25, // proportion that is outside
	color: 'black',
	labelOffset: { x: 0, y: 0 },
	labelize: function labelize() {
		return false;
	}, //utils.isNil(val) ? '' : val instanceof Date ? moment(val).format('YYYY') : val.toFixed(1);},
	label: '',
	labelFSize: 10,
	labelColor: 'black'
};

//
var axe = {
	ticks: {
		major: m.Tick,
		minor: _.extendOwn(_.extend({}, m.Tick), {
			show: false,
			length: 7,
			out: 0,
			color: 'gray',
			labelize: function labelize() {
				return '';
			}
		})
	},
	grid: {
		major: m.Grid,
		minor: _.extendOwn(_.extend({}, m.Grid), {
			width: 0.3
		})
	},
	show: true,
	// to force locally definition
	min: undefined,
	max: undefined,
	tickLabels: [], //{coord: where, label: ''}, coord in ds
	color: 'black',
	width: 1,
	label: '',
	labelOffset: { x: 0, y: 0 },
	labelAnchor: 'middle',
	labelFSize: 20,
	labelColor: 'black',
	empty: false,
	CS: 'cart',
	partner: 0,
	// for ticklabel formatting
	factor: 1,
	factorColor: 'black',
	factorOffset: { x: 0, y: 0 },
	factorAnchor: 'middle',
	factorFSize: 10
};

m.Axes = function (axis) {
	return {
		abs: _.map(axis.abs, function (p) {
			return _.extend({ placement: p }, axe);
		}),
		ord: _.map(axis.ord, function (p) {
			return _.extend({ placement: p }, axe);
		}),
		CS: 'cart'
	};
};

///
m.Graph = function (axis) {
	return {
		// general
		css: false,
		name: 'G',
		height: 400, // defines the universe's height
		width: 800, // defines the universe's width
		legend: {
			iconWidth: 30,
			iconHeight: 20,
			iconHMargin: 0, // offset from center
			iconVMargin: 0, // offset from center
			iconUnit: 'px'
		},
		foreground: undefined,
		background: undefined,
		title: '',
		titleFSize: 30,
		axisOnTop: false,
		// margins
		axisMargin: { left: 10, bottom: 10, right: 10, top: 10 }, // left, bottom, right, top
		outerMargin: {}, // left, bottom, right, top
		// data
		data: [],
		graphProps: [],
		// axis
		axisProps: m.Axes(axis),
		axis: undefined, // b = bottom, l = left, t = top, r = right, any combination; overrides xaxis and yaxis
		// shorcuts for easyness of use, overrides
		// settings in axisProps
		// label of axis
		xLabel: '',
		yLabel: '',
		xLabelFSize: null,
		yLabelFSize: null,
		// axis
		xaxis: '', // bottom || top
		yaxis: '', // left || right
		// data process
		discard: true
	};
};

var data = {
	type: 'Plain', // Plain, Bars, yBars, Stairs
	series: [], // x, y
	phantomSeries: [], // added points to play on the world's limit
	stacked: undefined, // x || y || null
	coordSys: 'cart', // cart || polar
	ord: {
		axis: 'left', // 'left' || 'right'
		type: 'number' // 'number' || 'date' || 'label'
	},
	abs: {
		axis: 'bottom', // 'bottom' || 'top'
		type: 'number' // 'number' || 'date' || 'label'
	}
};

m.defaults = function (key) {
	return key === 'data' ? data : graph[key]();
};

m.marksDefault = function (key) {
	return marks[key]();
};

module.exports = m;

},{"35":35,"8":8}],32:[function(require,module,exports){
'use strict';

/*
 * Responsible for making the ds object:
 *
 * ds is { c : {min, max}, d: {min,max}}
 */

var _ = require(8);
var utils = require(35);

/* If no marginsO are defined, here are the rules:
 *  - ticks and ticks labels are 20 px in the y dir (height of text),
 *			40 px in the x dir (length of text).
 *  - we take a 10px margin on title and labels
 *  - bottom and right margin:
 *			- 20px + ({x,y}LabelFSize + 10 px) if a {x,y}Label is defined,
 *  - top and left margin:
 *			- 20px + ({x,y}LabelFSize	+ 10 px) if a {x,y}Label is defined,
 *  - top margin takes a titleFSize + 10px more if a title is defined
 */
var defaults = {
	axis: {
		label: {
			bottom: 20,
			top: 20,
			left: 20,
			right: 20,
			mar: 10
		},
		ticks: {
			left: 20,
			right: 20,
			bottom: 15,
			top: 15
		},
		min: 3
	},
	title: 10,
	min: 0,
	max: 4
};

var m = {};

/* universe is {width , height}, this
 * is the total size of the svg picture.
 * The goal here is to compute the
 * world, i.e. the printed area
 *
 *				width
 * <------------------------>
 *  ________________________
 * |                        | ^
 * |   title/top axis       | |
 * |    ________________    | |
 * |   |                |   | |
 * |   |                |   | |
 * | 1 |                | 2 | |
 * |   |     WORLD      |   | | height
 * |   |                |   | |
 * |   |                |   | |
 * |   |________________|   | |
 * |                        | |
 * |   bottom axis          | |
 * |________________________| |
 *										^
 * 1 - left axis
 * 2 - right axis
 *
 *
 */

/*
 * We need to know some stuff to compute the margins:
 *
 *
 * title = {
 *  title: '', 
 *  titleFSize: 30
 * } if given
 *
 * universe = in coordinate space, length
 * 
 * borders = {
 *  axis: [{label: '', labelFSize: 15, placement: left}],
 *  marginsO: {l: 0,  r: 0}, 
 *  marginsI: {l: 10, r: 10},
 *  min: ,
 *  max:
 * } or
 * borders = {
 *  axis: [{label: '', labelFSize: 15, placement: bottom}],
 *  marginsO: {t: 0,  b: 0}, 
 *  marginsI: {t: 10, b: 10},
 *  min: ,
 *  max:
 * }
 *
 * marginsO is for the outer margin, it overrides any
 * computations of them du to title and axis definitions.
 * marginsI are the inner margins we add to the world to
 * have a more aesthetic view.
 *
 * If no marginsO are defined, here are the rules:
 *  - ticks and ticks labels are 20 px in the y dir (height of text),
 *			40 px in the x dir (length of text).
 *  - we take a 10px margin on title and labels
 *  - bottom and right margin:
 *			- 20px + ({x,y}LabelFSize + 10 px) if a {x,y}Label is defined,
 *  - top and left margin:
 *			- 20px + ({x,y}LabelFSize	+ 10 px) if a {x,y}Label is defined,
 *  - top margin takes a titleFSize + 10px more if a title is defined
 *
 * Then the data space is extended to the inner margin values,
 * then the data space can be even more extended to reach round values.
 *
 *	datas: {series:[{x:0, y:0}], stacked:'y', type:{ abs: 'number', ord: 'number'}], //
 *
 *
 * the cs/ds correspondance is found with:
 *    universe - marginsO - marginsI = datas
 */
var space = function space(datas, universe, borders, title) {
	// if no data, we don't waste time
	if (datas.length === 0) {
		return null;
	}

	// 1 - the coordinate space

	// get the (right,left) or (top,bottom)
	var places = [];
	for (var p in borders.marginsO) {
		places.push(p);
	}

	// compute the world
	// universe-world margins
	// min and max of coord space
	// margins between borders and axis
	var margins = {};
	for (p = 0; p < places.length; p++) {
		margins[places[p]] = defaults.min;
	}

	// fetch the margin (label + ticks + default) for an axis
	var margin = function margin(axis) {
		if (!axis.show) {
			return defaults.axis.min;
		}
		var marg = defaults.axis.label[axis.placement];
		if (!axis.empty) {
			marg += defaults.axis.ticks[axis.placement];
		}
		if (axis.label.length !== 0) {
			marg += axis.labelFSize + defaults.axis.label.mar;
		}
		return marg;
	};

	// labels
	for (var l = 0; l < borders.axis.length; l++) {
		var key = borders.axis[l].placement;
		margins[key] = Math.max(margins[key], margin(borders.axis[l]));
	}

	// title is at the top
	if (!utils.isNil(margins.top) && !utils.isNil(title)) {
		margins.top += title.title.length !== 0 ? title.titleFSize + defaults.title : 0;
	}

	// more suppleness, but less
	// efficiencies: automatic
	// margins computed whatever
	// happens, overwrite here
	// if defined
	for (p = 0; p < places.length; p++) {
		var k = places[p];
		if (!utils.isNil(borders.marginsO[k])) {
			margins[k] = borders.marginsO[k];
		}
		margins[k] = Math.max(margins[k], defaults.axis.min);
	}

	// we have the world's corners
	// the transformation between data space and the world space is
	// given by data space scaled to (world size - inner margins) and
	// placed at (origin.x.x + inner x margin, origin.y.y - inner y margin)
	var min, max;
	var rmin, rmax;
	if (utils.isNil(margins.left)) {
		min = universe - margins.bottom;
		max = margins.top;
		rmin = min - borders.marginsI.bottom;
		rmax = max + borders.marginsI.top;
	} else {
		min = margins.left;
		max = universe - margins.right;
		rmin = min + borders.marginsI.left;
		rmax = max - borders.marginsI.right;
	}

	var cWorld = {
		min: min,
		max: max
	};
	var posCWorld = {
		min: rmin,
		max: rmax
	};

	// 2 - the data space

	var allValues = _.flatten(datas);

	var mgr = allValues.length === 0 ? utils.mgr(5) : utils.mgr(allValues[0]);

	// either data defined or explicitely defined
	var minVals = function minVals(vals) {
		if (vals.length === 0) {
			return null;
		}

		return mgr.min(vals);
	};

	var maxVals = function maxVals(vals) {
		if (vals.length === 0) {
			return null;
		}

		return mgr.max(vals);
	};

	var bounds = {
		min: minVals(allValues),
		max: maxVals(allValues)
	};
	// empty graph
	if (!isFinite(bounds.min)) {
		bounds.min = mgr.value(0);
	}
	if (!isFinite(bounds.max)) {
		bounds.max = mgr.value(4);
	}

	// on augmente la distance totale
	var cRelMinMore = Math.abs((cWorld.min - posCWorld.min) / (posCWorld.max - posCWorld.min));
	var cRelMaxMore = Math.abs((cWorld.max - posCWorld.max) / (posCWorld.max - posCWorld.min));
	var dMinMore = mgr.multiply(mgr.distance(bounds.max, bounds.min), cRelMinMore);
	var dMaxMore = mgr.multiply(mgr.distance(bounds.max, bounds.min), cRelMaxMore);
	var dWorld = {
		min: mgr.subtract(bounds.min, dMinMore),
		max: mgr.add(bounds.max, dMaxMore)
	};

	// si imposé par l'utilisateur
	if (!utils.isNil(borders.min)) {
		dWorld.min = borders.min;
	}
	if (!utils.isNil(borders.max)) {
		dWorld.max = borders.max;
	}

	// on s'assure que ce sera toujours > 0, peu importe ce que dit l'user
	if (dWorld.min - dWorld.max === 0) {
		dWorld.min = mgr.subtract(bounds.min, mgr.smallestStep());
		dWorld.max = mgr.add(bounds.max, mgr.smallestStep());
	}

	/**
  * ds is { 
     c : {
       min, 
       max
     }, 
     d: {
       min,
       max
     }, 
     c2d , 
     d2c
   }
 */
	var fromCtoD = mgr.getValue(mgr.divide(mgr.distance(dWorld.max, dWorld.min), cWorld.max - cWorld.min));
	return {
		c: {
			min: cWorld.min,
			max: cWorld.max
		},
		d: {
			min: dWorld.min,
			max: dWorld.max
		},
		d2c: 1 / fromCtoD,
		c2d: fromCtoD
	};
};

m.spaces = function (datas, universe, borders, title) {

	var filter = function filter(datas, dir) {
		return _.map(datas, function (serie) {
			// global characteristics
			var loff = serie.limitOffset;
			var limOfIdx = dir === 'y' || utils.isNil(loff) ? -1 : loff > 0 ? serie.series.length - 1 : 0;
			return _.map(serie.series, function (point, idx) {
				// if label
				if (utils.isString(point[dir])) {
					return idx;
				}
				var val = point[dir];

				// modifiers are span, drop and offset
				// offset changes the value
				if (!utils.isNil(point.offset) && !utils.isNil(point.offset[dir])) {
					var mgr = utils.mgr(val);
					val = mgr.add(val, point.offset[dir]);
				}
				// drop adds a value
				if (!utils.isNil(point.drop) && !utils.isNil(point.drop[dir])) {
					val = [val];
					val.push(point.drop[dir]);
				}

				// span makes value into two values,
				// we do it three, to keep the ref value
				if (!utils.isNil(point.span) && !utils.isNil(point.span[dir])) {
					// beware, do we have a drop?
					val = utils.isArray(val) ? val : [val];
					var mm = utils.mgr(val[0]);
					val.push(mm.subtract(val[0], mm.divide(point.span[dir], 2)));
					val.push(mm.add(val[0], mm.divide(point.span[dir], 2)));
				}

				// limitOffset changes only one boundary
				if (limOfIdx === idx) {
					if (utils.isArray(val)) {
						val = _.map(val, function (v) {
							return v + loff;
						});
					} else {
						val += loff;
					}
				}

				return val;
			}).concat(_.map(serie.phantomSeries, function (p) {
				return p[dir];
			}));
		});
	};

	var ob = { right: 'ord', left: 'ord', top: 'abs', bottom: 'abs' };
	var dats = {};
	for (var w in ob) {
		dats[w] = _.filter(datas, function (series) {
			return !!series[ob[w]] && series[ob[w]].axis === w;
		});
	}

	var mins = {};
	var maxs = {};
	for (w in ob) {
		mins[w] = null;
		maxs[w] = null;
		for (var i = 0; i < borders[ob[w]].length; i++) {
			if (borders[ob[w]][i].placement !== w) {
				continue;
			}
			// min
			var mgr;
			if (!utils.isNil(borders[ob[w]][i].min)) {
				mgr = utils.mgr(borders[ob[w]][i].min);
				if (utils.isNil(mins[w]) || mgr.lowerThan(borders[ob[w]][i].min, mins[w])) {
					mins[w] = borders[ob[w]][i].min;
				}
			}
			// max
			if (!utils.isNil(borders[ob[w]][i].max)) {
				mgr = utils.mgr(borders[ob[w]][i].max);
				if (utils.isNil(maxs[w]) || mgr.greaterThan(borders[ob[w]][i].max, maxs[w])) {
					maxs[w] = borders[ob[w]][i].max;
				}
			}
		}
	}

	// worlds = (l,b), (l,t), (r,b), (r,t)
	var rights = filter(dats.right, 'y');
	var lefts = filter(dats.left, 'y');
	var top = filter(dats.top, 'x');
	var bottom = filter(dats.bottom, 'x');

	var border = {};
	border.ord = {
		marginsO: { top: borders.marginsO.top, bottom: borders.marginsO.bottom },
		marginsI: { top: borders.marginsI.top, bottom: borders.marginsI.bottom },
		axis: borders.abs
	};

	border.abs = {
		marginsO: { left: borders.marginsO.left, right: borders.marginsO.right },
		marginsI: { left: borders.marginsI.left, right: borders.marginsI.right },
		axis: borders.ord
	};

	var bor = {};
	for (w in ob) {
		// copy/expand
		bor[w] = _.extend(_.extend({}, border[ob[w]]), { min: mins[w], max: maxs[w] });
	}

	return {
		y: {
			left: space(lefts, universe.height, bor.left, title),
			right: space(rights, universe.height, bor.right, title)
		},
		x: {
			bottom: space(bottom, universe.width, bor.bottom),
			top: space(top, universe.width, bor.top)
		}
	};
};

module.exports = m;

},{"35":35,"8":8}],33:[function(require,module,exports){
'use strict';

/*
 * various transformation between a data space
 * and a coordinate space.
 *
 * We have linear, we need:
 *
 *  - log
 *  - polar
 */

var utils = require(35);

/**
 * ds is { c : {min, max}, d: {min,max}, c2d , d2c}
 */

var m = {};

m.toC = function (ds, data) {
  return utils.homothe(ds.d.min, ds.c.min, ds.d2c, data);
};

m.toCwidth = function (ds, dist) {
  var d = dist === undefined ? 1 : utils.toValue(dist);
  return Math.abs(ds.d2c * d);
};

m.toD = function (ds, coord) {
  return utils.homothe(ds.c.min, ds.d.min, ds.c2d, coord);
};

m.toDwidth = function (ds, dist) {
  var d = dist === undefined ? 1 : utils.toValue(dist);
  return Math.abs(ds.c2d * d);
};

m.fromPic = function (ds, data) {
  var fac = ds.c.max - ds.c.min;
  return utils.homothe(0, ds.c.min, fac, data);
};

module.exports = m;

},{"35":35}],34:[function(require,module,exports){
'use strict';

var utils = require(35);
var _ = require(8);

/*
 * beware of distance (period) versus
 * values (date), see {date,nbr}Mgr.js
*/
var computeTicks = function computeTicks(first, last, minor, fac) {
	var mgr = utils.mgr(first);
	var start = mgr.closestRoundUp(first, mgr.divide(mgr.distance(first, last), 10));
	var length = mgr.distance(start, last);
	// distance min criteria 1
	// 10 ticks max
	var dec = mgr.divide(length, 10);
	var majDist = mgr.roundUp(dec);
	var minDist = mgr.roundDown(majDist);

	// redefine start to have the biggest rounded value
	var biggestRounded = mgr.orderMagValue(last, first);
	start = utils.isNil(biggestRounded) ? start : biggestRounded;
	while (mgr.greaterThan(start, first) || mgr.equal(start, first)) {
		start = mgr.subtract(start, majDist);
	}
	start = mgr.add(start, majDist);
	length = mgr.distance(start, last);
	var llength = mgr.multiply(majDist, mgr.labelF);

	var out = [];
	var curValue = start;
	// if a date, might want a first label with no tick
	if (mgr.type === 'date') {
		var pos = mgr.subtract(curValue, majDist);
		if (mgr.greaterThan(mgr.distance(first, curValue), llength)) {
			out.push({
				position: pos,
				offset: {
					along: mgr.offset(majDist),
					perp: 0
				},
				label: mgr.label(pos, majDist, fac),
				show: false,
				showLabel: true
			});
		}
	}

	while (mgr.lowerThan(curValue, last)) {
		var lte = mgr.distance(curValue, last);
		out.push({
			position: curValue,
			offset: {
				along: mgr.offset(majDist),
				perp: 0
			},
			extra: false,
			label: mgr.type !== 'date' || mgr.greaterThan(lte, llength) ? mgr.label(curValue, majDist, fac) : '',
			minor: false
		});
		// minor ticks
		if (minor) {
			var curminValue = mgr.add(curValue, minDist);
			var ceil = mgr.add(curValue, majDist);
			while (mgr.lowerThan(curminValue, ceil)) {
				if (mgr.greaterThan(curminValue, last)) {
					break;
				}
				out.push({
					position: curminValue,
					offset: {
						along: mgr.offset(minDist),
						perp: 0
					},
					extra: false,
					label: mgr.label(curminValue, minDist, fac),
					minor: true
				});
				curminValue = mgr.add(curminValue, minDist);
			}
		}

		curValue = mgr.add(curValue, majDist);
	}

	out = out.concat(mgr.extraTicks(majDist, first, last, out));
	return out;
};

var m = {};

m.ticks = function (start, length, labels, minor, fac) {
	if (!!labels && labels.length > 0) {
		return _.map(labels, function (lab) {
			return {
				position: lab.coord,
				label: lab.label,
				offset: {
					along: 0,
					perp: 0
				}
			};
		});
	}

	return computeTicks(start, length, minor, fac);
};

module.exports = m;

},{"35":35,"8":8}],35:[function(require,module,exports){
'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
	return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
	return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var date = require(25);
var nbr = require(29);

var m = {};

var isPeriod = function isPeriod(v) {
	var out = false;
	for (var t in { years: true, months: true, weeks: true, days: true }) {
		out = out || !m.isNil(v[t]);
	}
	return out;
};

m.math = require(28);

m.isDate = function (v) {
	return !!v && (v instanceof Date || isPeriod(v));
};

m.isArray = function (v) {
	return !!v && Array.isArray(v);
};

m.isString = function (v) {
	return !!v && typeof v === 'string';
};

m.isNil = function (v) {
	return v === null || v === undefined;
};

m.isValidNumber = function (r) {
	return !m.isNil(r) && !isNaN(r) && isFinite(r);
};

m.isValidParam = function (p) {
	return m.isDate(p) || m.isString(p) || m.isValidNumber(p);
};

m.deepCp = function (tgt, thing) {

	if ((typeof thing === 'undefined' ? 'undefined' : _typeof(thing)) === 'object') {
		if (!tgt || (typeof tgt === 'undefined' ? 'undefined' : _typeof(tgt)) !== 'object') {
			if (m.isArray(thing)) {
				tgt = [];
			} else if (thing instanceof Date) {
				tgt = new Date(thing.getTime());
			} else if (thing === null) {
				return null;
			} else {
				tgt = {};
			}
		}
		for (var t in thing) {
			tgt[t] = m.deepCp(tgt[t], thing[t]);
		}
	} else {
		tgt = thing;
	}
	return tgt;
};

m.mgr = function (ex) {
	return m.isDate(ex) ? date : nbr;
};

m.homothe = function (src, tgt, fac, val) {
	var t = m.isDate(tgt) ? date.getValue(tgt) : tgt;
	var v = m.isDate(val) ? date.getValue(val) : val;
	var s = m.isDate(src) ? date.getValue(src) : src;
	var sol = t + (v - s) * fac;
	return m.isDate(tgt) ? new Date(sol) : sol;
};

m.toValue = function (val) {
	return m.isDate(val) ? date.getValue(val) : val;
};

m.direction = function (line) {
	// line is AC
	//
	//             C
	//            /|
	//          /  |
	//        /    |
	//      /      |
	//    /        |
	//	A -------- B
	//

	var distSqr = function distSqr(p1, p2) {
		return (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
	};
	var B = { x: line.end.x, y: line.start.y };
	var AB = distSqr(line.start, B);
	var BC = distSqr(B, line.end);

	return { x: AB, y: BC, line: distSqr(line.end, line.start) };
};

// to make proper period objects
m.makePeriod = date.makePeriod;

module.exports = m;

},{"25":25,"28":28,"29":29}],36:[function(require,module,exports){
'use strict';

var React = require("react");
var Mark = require(50);
var _ = require(8);
var imUtils = require(26);

/*
	{
		markType: 'bar'
		marks: [Bar]
	}
*/

var BarChart = React.createClass({
	displayName: 'BarChart',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {

		if (this.props.state.marks.length === 0) {
			return null;
		}

		return React.createElement('g', null, _.map(this.props.state.marks, function (bar) {
			return React.createElement(Mark, { key: bar.key, state: bar, type: 'bar' });
		}));
	}
});

module.exports = BarChart;

},{"26":26,"50":50,"8":8,"react":"react"}],37:[function(require,module,exports){
'use strict';

var React = require("react");

var _ = require(8);
var space = require(33);
var imUtils = require(26);
var utils = require(35);

/*
	{
		ds: {
			x: {},
			y: {}
		},
		color: '',
		fill: '',
		width: ,
		stairs: '',
		positions: [{x: , y: , fill: ''}], // start or end
		drops: [{x: , y: }],
		dropLine: {
			x: true || false,
			y: true || false
		}
	}
*/

var Bins = React.createClass({
	displayName: 'Bins',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	bin: function bin(point, drop, delta, idx) {

		var state = this.props.state;

		var p = {
			x: space.toC(state.ds.x, point.x),
			y: space.toC(state.ds.y, point.y)
		};

		var d = {
			x: space.toC(state.ds.x, drop.x),
			y: space.toC(state.ds.y, drop.y)
		};

		var del = space.toCwidth(state.ds.x, delta);

		var path = '';
		switch (state.stairs) {
			case 'right':
				var pr1 = p.x + ' ' + d.y;
				var pr2 = p.x + ' ' + p.y;
				var pr3 = p.x + del + ' ' + p.y;
				var pr4 = p.x + del + ' ' + d.y;
				path = 'M ' + pr1 + ' L ' + pr2 + ' L ' + pr3 + ' L ' + pr4;
				break;
			case 'left':
				var pl1 = p.x - del + ' ' + d.y;
				var pl2 = p.x - del + ' ' + p.y;
				var pl3 = p.x + ' ' + p.y;
				var pl4 = p.x + ' ' + d.y;
				path = 'M ' + pl1 + ' L ' + pl2 + ' L ' + pl3 + ' L ' + pl4;
				break;
		}

		var color = point.fill || state.fill;
		var shade = state.shade || 1;

		return React.createElement('path', { key: idx, d: path, strokeWidth: 0, fill: color, opacity: shade });
	},

	path: function path() {

		var state = this.props.state;
		if (state.positions.length === 0) {
			return null;
		}
		var positions = state.positions;
		var ds = state.ds;
		var drops = state.drops;

		var coord = function coord(idx, idy) {
			idy = utils.isNil(idy) ? idx : idy;
			return space.toC(ds.x, positions[idx].x) + ',' + space.toC(ds.y, positions[idy].y);
		};

		var dropy = function dropy(idx) {
			return space.toC(ds.x, positions[idx].x) + ',' + space.toC(ds.y, drops[idx].y);
		};

		var dropx = function dropx(idx) {
			return space.toC(ds.x, drops[idx].x) + ',' + space.toC(ds.y, positions[idx].y);
		};

		var Nd = state.positions.length;
		var data = '';
		var delta = state.positions.length > 1 ? space.toCwidth(ds.x, positions[1].x - positions[0].x) : 10;
		switch (state.stairs) {
			case 'right':
				// right stairs
				data = (state.dropLine.y ? dropy(0) + ' ' : '') + coord(0);
				for (var i = 1; i < Nd; i++) {
					data += ' ' + coord(i, i - 1) + ' ' + coord(i);
					if (state.dropLine.y) {
						data += ' ' + dropy(i) + ' ' + coord(i);
					}
					if (state.dropLine.x) {
						data += ' ' + dropx(i) + ' ' + coord(i);
					}
				}
				data += ' ' + (space.toC(ds.x, positions[Nd - 1].x) + delta) + ',' + space.toC(ds.y, positions[Nd - 1].y); // point
				if (state.dropLine.y) {
					data += ' ' + (space.toC(ds.x, positions[Nd - 1].x) + delta) + ',' + space.toC(ds.y, drops[Nd - 1].y); // drop
				}
				break;
			case 'left':
				// left stairs
				if (state.dropLine.y) {
					data += space.toC(ds.x, positions[0].x) - delta + ',' + space.toC(ds.y, drops[0].y); // drop
				}
				data += ' ' + (space.toC(ds.x, positions[0].x) - delta) + ',' + space.toC(ds.y, positions[0].y); // point
				data += ' ' + coord(0);
				for (i = 1; i < Nd; i++) {
					if (state.dropLine.x) {
						data += ' ' + dropx(i - 1) + ' ' + coord(i - 1);
					}
					if (state.dropLine.y) {
						data += ' ' + dropy(i - 1) + ' ' + coord(i - 1);
					}
					data += ' ' + coord(i - 1, i) + ' ' + coord(i);
				}
				data += state.dropLine.y ? ' ' + dropy(Nd - 1) : '';
				break;
			default:
				throw 'Stairs are either right or left';
		}

		return React.createElement('polyline', { points: data, stroke: state.color, strokeWidth: state.width, fill: 'none' });
	},

	render: function render() {

		var state = this.props.state;
		var delta = state.positions.length > 1 ? state.positions[1].x - state.positions[0].x : 1;
		var me = this;

		return React.createElement('g', null, _.map(state.positions, function (pos, idx) {
			return me.bin(pos, state.drops[idx], delta, idx);
		}), this.path());
	}
});

module.exports = Bins;

},{"26":26,"33":33,"35":35,"8":8,"react":"react"}],38:[function(require,module,exports){
'use strict';

var React = require("react");

var _ = require(8);
var space = require(33);
var imUtils = require(26);

/*
	 {
		show: true || false,
		ds: {
			x: {},
			y: {}
		},
		color: '',
		fill: '',
		width: ,
		shade: ,
		positions: [{x: , y: }],
		drops: [{x: , y: }],
		close: {
			x: true || false,
			y: true || false
		},
		dropLine: {
			x: true || false,
			y: true || false
		}
	}
*/

var Path = React.createClass({
	displayName: 'Path',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {

		var state = this.props.state;

		if (state.show === false || state.positions.length === 0) {
			return null;
		}

		var ds = state.ds;
		var pos = state.positions;
		var drops = state.drops;

		var coord = function coord(idx) {
			return space.toC(ds.x, pos[idx].x) + ',' + space.toC(ds.y, pos[idx].y);
		};

		var dropx = function dropx(idx) {
			return space.toC(ds.x, drops[idx].x) + ',' + space.toC(ds.y, pos[idx].y);
		};

		var dropy = function dropy(idx) {
			return space.toC(ds.x, pos[idx].x) + ',' + space.toC(ds.y, drops[idx].y);
		};

		var points = 'M ' + coord(0);
		for (var i = 1; i < state.positions.length; i++) {
			points += ' L ' + coord(i);
		}

		// we close the curve if wanted
		// y dir has prevalence
		var filling = points;
		if (state.close.y) {
			for (i = drops.length - 1; i >= 0; i--) {
				filling += ' L ' + dropy(i);
			}
		} else if (state.close.x) {
			for (i = drops.length - 1; i >= 0; i--) {
				filling += ' L ' + dropx(i);
			}
		}
		filling += 'z';

		// droplines
		var dropLines = [];
		var color = state.color;
		var width = state.width;
		var shade = state.shade;

		if (state.dropLine.y) {
			dropLines = _.map(state.positions, function (pos, idx) {
				var path = 'M ' + coord(idx) + ' L ' + dropy(idx);
				var key = state.key + '.dl.' + idx;
				return React.createElement('path', { key: key, d: path, stroke: color, strokeWidth: width, opacity: shade });
			});
		}
		if (state.dropLine.x) {
			dropLines = _.map(state.positions, function (pos, idx) {
				var path = 'M ' + coord(idx) + ' L ' + dropx(idx);
				var key = state.key + '.dl.' + idx;
				return React.createElement('path', { key: key, d: path, stroke: color, strokeWidth: width, opacity: shade });
			});
		}

		return React.createElement('g', null, state.close.y || state.close.x ? React.createElement('path', {
			d: filling,
			strokeWidth: 0,
			opacity: shade,
			fill: state.fill }) : null, React.createElement('path', {
			d: points,
			stroke: color,
			strokeWidth: width,
			opacity: shade,
			fill: 'none' }), dropLines);
	}

});

module.exports = Path;

},{"26":26,"33":33,"8":8,"react":"react"}],39:[function(require,module,exports){
'use strict';

var React = require("react");

var imUtils = require(26);

var Pie = React.createClass({
	displayName: 'Pie',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {

		var labels = this.props.state.path.labels;
		var positions = this.props.state.path.positions;
		if (positions.length === 0) {
			return null;
		}
		var pinRad = this.props.state.path.pinRadius;
		var pinLen = this.props.state.path.pinLength;
		var pinOff = this.props.state.path.pinHook;
		var pinDraw = this.props.state.path.pinDraw;
		var pfs = this.props.state.path.pinFontSize;
		//var ds = state.ds;

		var abs = function abs(ang, rad, or) {
			return rad * Math.cos(ang * Math.PI / 180) + or.x;
		};
		var coo = function coo(ang, rad, or) {
			return -rad * Math.sin(ang * Math.PI / 180) + or.y;
		};

		var ori = this.props.state.path.origin;
		var oldT = 0;
		var out = [];
		var r = this.props.state.path.radius;
		var rin = this.props.state.path.toreRadius;
		var x = abs(oldT, r, ori);
		var y = coo(oldT, r, ori);
		for (var p = 0; p < positions.length; p++) {

			var color = positions[p].color;
			var theta = Math.min(positions[p].value, 359.9640); // more than 99.99% is a circle (not supported by arc anyway)
			var label = !!labels[p] ? labels[p] : null;
			var x1 = abs(oldT, rin, ori);
			var y1 = coo(oldT, rin, ori);
			var x2 = abs(oldT, r, ori);
			var y2 = coo(oldT, r, ori);
			var x3 = abs(theta + oldT, r, ori);
			var y3 = coo(theta + oldT, r, ori);
			var x4 = abs(theta + oldT, rin, ori);
			var y4 = coo(theta + oldT, rin, ori);

			// large-arc-flag, true if theta > 180
			var laf = theta > 180 ? 1 : 0;
			var path = 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2 + ' A' + r + ',' + r + ' 0 ' + laf + ',0 ' + x3 + ',' + y3 + ' L ' + x4 + ',' + y4 + ' A' + rin + ',' + rin + ' 0 ' + laf + ',1 ' + x1 + ',' + y1;

			out.push(React.createElement('path', { key: p, fill: color, stroke: 'none', strokeWidth: '0', d: path }));

			if (!!label) {
				var curAng = theta / 2 + oldT;
				var offset = curAng === 90 || curAng === 270 ? 0 : curAng > 90 && curAng < 270 ? -pinOff : pinOff;
				var xc1 = abs(curAng, pinRad, ori);
				var yc1 = coo(curAng, pinRad, ori);
				var xc2 = abs(curAng, pinRad + pinLen, ori);
				var yc2 = coo(curAng, pinRad + pinLen, ori);
				var xc3 = xc2 + offset;
				var yc3 = yc2;
				var xc = xc3 + offset / 2;
				var yc = yc2 + (curAng === 90 ? -5 : curAng === 270 ? 5 : 0);
				var lstyle = {
					textAnchor: curAng === 90 || curAng === 270 ? 'center' : curAng > 90 && curAng < 270 ? 'end' : 'start'
				};
				if (pinDraw) {
					var lpath = 'M' + xc1 + ',' + yc1 + ' L' + xc2 + ',' + yc2 + ' L' + xc3 + ',' + yc3;
					out.push(React.createElement('path', { key: p + '.ll', strokeWidth: '1', stroke: 'black', fill: 'none', d: lpath }));
				}
				out.push(React.createElement('text', { fontSize: pfs, key: p + '.l', x: xc, y: yc, style: lstyle }, label));
			}
			x = x2;
			y = y2;
			oldT += theta;
		}

		return React.createElement('g', null, out);
	}
});

module.exports = Pie;

},{"26":26,"react":"react"}],40:[function(require,module,exports){
'use strict';

var React = require("react");
var Path = require(38);
var Mark = require(50);
var _ = require(8);

var imUtils = require(26);

/*
	{
		path: Path,
		markType: '',
		marks: [Dot || Square]
	}
*/
var PlainChart = React.createClass({
	displayName: 'PlainChart',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {
		var _this = this;

		var marks = this.props.state.marks;
		return marks.length === 0 ? React.createElement(Path, { state: this.props.state.path }) : React.createElement('g', null, React.createElement(Path, { state: this.props.state.path }), _.map(marks, function (point) {
			return React.createElement(Mark, { key: point.key, state: point, type: _this.props.state.markType });
		}));
	}
});

module.exports = PlainChart;

},{"26":26,"38":38,"50":50,"8":8,"react":"react"}],41:[function(require,module,exports){
'use strict';

var React = require("react");
var Bins = require(37);
var Mark = require(50);
var _ = require(8);

var imUtils = require(26);

/*
	{
		markType: '',
		marks: [Dot || Square],
		path: Bins 
	}
*/

var StairsChart = React.createClass({
	displayName: 'StairsChart',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {
		var _this = this;

		var marks = this.props.state.marks;
		return marks.length === 0 ? React.createElement(Bins, { state: this.props.state.path }) : React.createElement('g', null, React.createElement(Bins, { state: this.props.state.path }), _.map(marks, function (point) {
			return React.createElement(Mark, { key: point.key, state: point, type: _this.props.state.markType });
		}));
	}
});

module.exports = StairsChart;

},{"26":26,"37":37,"50":50,"8":8,"react":"react"}],42:[function(require,module,exports){
"use strict";

var m = {};

m.VM = function () {
	return null;
};

module.exports = m;

},{}],43:[function(require,module,exports){
'use strict';

var React = require("react");
var Plain = require(40);
var Stairs = require(41);
var BarChart = require(36);
var Pie = require(39);

var utils = require(35);

// the graphs function generator
var graph = {};

graph.Plain = function (props) {
	return React.createElement(Plain, { key: props.key, state: props });
};

graph.Stairs = function (props) {
	return React.createElement(Stairs, { key: props.key, state: props });
};

graph.Bars = graph.yBars = function (props) {
	return React.createElement(BarChart, { key: props.key, state: props });
};

graph.Pie = function (props) {
	return React.createElement(Pie, { key: props.key, state: props });
};

var m = function m(key, props) {
	if (utils.isNil(graph[key])) {
		throw new Error('Unknown graph type "' + key + '"');
	}

	return graph[key](props);
};

module.exports = m;

},{"35":35,"36":36,"39":39,"40":40,"41":41,"react":"react"}],44:[function(require,module,exports){
'use strict';

var _ = require(8);
var space = require(33);
var utils = require(35);
var color = require(24);

var m = {

	VM: function VM(serie, props, ds) {

		var sum = _.reduce(serie, function (memo, value) {
			return memo + value.value;
		}, 0);
		var positions = _.map(serie, function (point, idx) {
			return {
				value: Math.max(Math.min(point.value / sum * 360, 360), 0),
				color: point.color || color(idx)
			};
		});

		var origin = {
			x: space.toC(ds.x, props.pieOrigin.x + (ds.x.d.max + ds.x.d.min) / 2),
			y: space.toC(ds.y, props.pieOrigin.y + (ds.y.d.max + ds.y.d.min) / 2)
		};

		var labels = [];
		if (props.tag.show) {
			labels = _.map(serie, function (val) {
				return props.tag.print(val.tag);
			});
		}

		var maxR = Math.min(space.toCwidth(ds.x, ds.x.d.max - ds.x.d.min) / 2, space.toCwidth(ds.y, ds.y.d.max - ds.y.d.min) / 2);

		var radius = utils.isNil(props.pieRadius) ? maxR : Math.min(maxR, props.pieRadius);

		return {
			ds: ds,
			fill: props.pie !== 'tore',
			positions: positions,
			origin: origin,
			radius: radius,
			toreRadius: props.pieToreRadius * radius,
			labels: labels,
			pinRadius: props.tag.pinRadius * radius,
			pinLength: props.tag.pinLength * radius,
			pinHook: props.tag.pinHook,
			pinDraw: props.tag.pin,
			pinFontSize: props.tag.fontSize
		};
	}
};

module.exports = m;

},{"24":24,"33":33,"35":35,"8":8}],45:[function(require,module,exports){
'use strict';

var utils = require(35);
var _ = require(8);

var m = {};

m.VM = function (serie, props, ds) {

	// easy stuff
	var color = props.color || 'back';
	var fill = props.fill || 'none';
	var width = utils.isNil(props.width) ? 1 : props.width; // 0 is valid
	var shade = props.shade || 1;

	var positions = _.map(serie, function (point) {
		return { x: point.x, y: point.y };
	});
	var drops = _.map(serie, function (point) {
		return { x: point.drop.x, y: point.drop.y };
	});

	var clx = false;
	var cly = fill !== 'none';

	var dlx = props.dropLine.x || false;
	var dly = props.dropLine.y || false;

	return {
		ds: ds,
		color: color,
		fill: fill,
		shade: shade,
		width: width,
		positions: positions,
		drops: drops,
		close: {
			x: clx,
			y: cly
		},
		dropLine: {
			x: dlx,
			y: dly
		}
	};
};

module.exports = m;

},{"35":35,"8":8}],46:[function(require,module,exports){
'use strict';

var utils = require(35);
var _ = require(8);
var shader = require(24);

var m = {};

m.VM = function (serie, props, ds) {

	// easy stuff
	var color = props.color || 'back';
	var fill = props.fill || 'none';
	var width = utils.isNil(props.width) ? 1 : props.width; // 0 is valid
	var stairs = props.stairs || 'right';
	var shade = props.shade || 1;

	var positions = _.map(serie, function (point) {
		return { x: point.x, y: point.y };
	});
	var drops = _.map(serie, function (point) {
		return { x: point.drop.x, y: point.drop.y };
	});

	// color can be bin-defined
	// 1 - a shader
	if (!utils.isNil(props.shader) && props.shader.type === 'fill') {
		// we don't care about 'color'
		shader(props.shader, positions);
	}

	// 2 - explicit, takes precedence
	_.each(serie, function (point, idx) {
		if (!utils.isNil(point.fill)) {
			positions[idx].fill = point.fill;
		}
	});

	var dlx = props.dropLine.x || false;
	var dly = props.dropLine.y || false;

	return {
		ds: ds,
		color: color,
		fill: fill,
		shade: shade,
		width: width,
		stairs: stairs,
		positions: positions,
		drops: drops,
		dropLine: {
			x: dlx,
			y: dly
		}
	};
};

module.exports = m;

},{"24":24,"35":35,"8":8}],47:[function(require,module,exports){
'use strict';

var React = require("react");

var icon = {};
icon.square = icon.Square = function (data, open) {
	var l = Math.min(data.width, data.height) * 3 / 5;
	var x = data.hMargin + (data.width - l) / 2;
	var y = data.vMargin + (data.height - l);
	var f = open ? 'none' : data.color;
	return React.createElement('rect', { x: x, y: y, width: l, height: l, fill: f, stroke: data.color });
};

icon.opensquare = icon.OpenSquare = function (data) {
	return icon.square(data, true);
};

icon.dot = icon.Dot = function (data, open) {
	var x = (data.width + 2 * data.hMargin) / 2;
	var r = Math.min(data.height, data.width) * 3 / 10; // 3 / 5 de remplissage
	var y = data.height + data.vMargin - r;
	var f = open ? 'none' : data.color;
	return React.createElement('circle', { cx: x, cy: y, r: r, fill: f, stroke: data.color });
};

icon.opendot = icon.OpenDot = function (data) {
	return icon.dot(data, true);
};

icon.bar = icon.Bar = icon.square;

icon.pie = icon.Pie = function (data) {
	var x = data.hMargin + data.width / 2;
	var y = 2 * data.vMargin + data.height;
	var r = data.height;
	var x1 = x + r * Math.cos(3 / 8 * Math.PI);
	var y1 = y - r * Math.sin(3 / 8 * Math.PI);
	var x2 = x + r * Math.cos(5 / 8 * Math.PI);
	var y2 = y - r * Math.sin(5 / 8 * Math.PI);

	var path = 'M' + x + ',' + y + ' L' + x1 + ',' + y1 + ' A' + r + ',' + r + ' 0 0,0 ' + x2 + ',' + y2 + ' z';
	return React.createElement('path', { fill: data.color, d: path });
};

icon.line = function (data) {

	var l = Math.min(data.width, data.height);
	var x1 = data.hMargin + (data.width - l) / 2;
	var x2 = x1 + l;
	var y = data.vMargin + (data.height - 6); // fraction of height of letters...
	return React.createElement('line', { x1: x1, y1: y, x2: x2, y2: y, stroke: data.color, strokeWidth: data.strokeWidth });
};

var m = {};

m.icon = function (data, key) {
	if (!icon[key]) {
		throw new Error('unrecognized mark type: "' + key + '"');
	}

	return icon[key](data);
};

module.exports = m;

},{"react":"react"}],48:[function(require,module,exports){
'use strict';

var React = require("react");
var dataScale = require(33);
var utils = require(35);
var imUtils = require(26);

/*
	{
		draw: false,
		ds: {
			x: {}, // see space-mgr for details
			y: {}
		}, // see space-mgr for details
		position:{
			x:0,
			y:0
		},
		drop:{
			x:null, 
			y:0
		},
		width: 0,
		span: 0.5,
		color: '',
		fill: '',
		shade: 1
	}
*/

var BarMark = React.createClass({
	displayName: 'BarMark',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {

		var state = this.props.state;

		var mgr = {
			x: utils.mgr(state.position.x),
			y: utils.mgr(state.position.y)
		};

		var ds = state.ds;

		var position = state.position;

		var span = {
			x: utils.isNil(state.span.x) ? 0 : state.span.x,
			y: utils.isNil(state.span.y) ? 0 : state.span.y
		};

		var drop = {
			x: utils.isNil(state.drop.x) ? state.position.x : state.drop.x,
			y: utils.isNil(state.drop.y) ? state.position.y : state.drop.y
		};

		var toC = function toC(dir) {
			var op = dir === 'y' ? 'add' : 'subtract';
			return dataScale.toC(ds[dir], mgr[dir][op](position[dir], mgr[dir].divide(span[dir], 2))); // all in dataSpace
		};

		var x = toC('x');
		var y = toC('y');

		var toCwidth = function toCwidth(dir) {
			return dataScale.toCwidth(ds[dir], mgr[dir].add(mgr[dir].distance(drop[dir], position[dir]), span[dir]));
		};

		var height = toCwidth('y');
		var width = toCwidth('x');
		if (mgr.y.lowerThan(position.y, drop.y)) {
			y -= height;
		}
		if (mgr.x.greaterThan(position.x, drop.x)) {
			x -= width;
		}

		var color = state.color || state.fill || 'none';
		var stroke = state.draw ? color : null;
		if (drop.y > state.y) {
			y -= height;
		}

		return React.createElement('rect', { x: x, y: y, height: height, width: width,
			stroke: stroke, strokeWidth: state.strokeWidth,
			fill: color, opacity: state.shade });
	}
});

module.exports = BarMark;

},{"26":26,"33":33,"35":35,"react":"react"}],49:[function(require,module,exports){
'use strict';

var React = require("react");
var dataScale = require(33);
var imUtils = require(26);

/*
	{
		draw: true || false,
		ds: {
			x: {}, 
			y:{}
		},
		position: {
			x: 0,
			y: 0
		},
		radius: ,
		color: '',
		width: ,
		fill: ,
		size: ,
		shade: 1
	}
*/

var DotMark = React.createClass({
	displayName: 'DotMark',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {
		var state = this.props.state;

		var x = dataScale.toC(state.ds.x, state.position.x);
		var y = dataScale.toC(state.ds.y, state.position.y);
		var r = state.radius || state.size;
		var f = state.fill || state.color;

		return React.createElement('circle', { cx: x, cy: y, r: r, fill: f, opacity: state.shade, stroke: state.color, strokeWidth: state.width });
	}
});

module.exports = DotMark;

},{"26":26,"33":33,"react":"react"}],50:[function(require,module,exports){
'use strict';

var React = require("react");

var Dot = require(49);
var Bar = require(48);
var Square = require(51);

var imUtils = require(26);

var Mark = React.createClass({
	displayName: 'Mark',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	mark: function mark(state) {
		switch (this.props.type) {
			case 'square':
			case 'Square':
			case 'opensquare':
			case 'OpenSquare':
				return React.createElement(Square, { state: state });
			case 'dot':
			case 'Dot':
			case 'opendot':
			case 'OpenDot':
				return React.createElement(Dot, { state: state });
			case 'bar':
			case 'Bar':
				return React.createElement(Bar, { state: state });
			default:
				throw new Error('unrecognized mark type: "' + this.props.type + '"');
		}
	},

	pin: function pin(pinS) {
		return !!pinS.path ? React.createElement('g', null, React.createElement('path', { strokeWidth: '1', stroke: pinS.pinColor, fill: 'none', d: pinS.path }), React.createElement('text', { fontSize: pinS.labelFS, style: { textAnchor: pinS.labelAnc }, fill: pinS.color, x: pinS.xL, y: pinS.yL }, pinS.label)) : React.createElement('text', { fontSize: pinS.labelFS, style: { textAnchor: pinS.labelAnc }, fill: pinS.color, x: pinS.xL, y: pinS.yL }, pinS.label);
	},

	render: function render() {
		return this.props.state.pin ? React.createElement('g', null, this.mark(this.props.state), this.pin(this.props.state.pin)) : this.mark(this.props.state);
	}
});

module.exports = Mark;

},{"26":26,"48":48,"49":49,"51":51,"react":"react"}],51:[function(require,module,exports){
'use strict';

var React = require("react");
var dataScale = require(33);
var imUtils = require(26);

/*
	{
		draw: false,
		ds: {
			x: {},
			y: {}
		},
		position:{
			x: 0,
			y: 0
		},
		color: 'black',
		width: 0,
		fill: undefined,
		size: 0,
		shade: 1
	}
*/

var SquareMark = React.createClass({
	displayName: 'SquareMark',

	shouldComponentUpdate: function shouldComponentUpdate(props) {
		return !imUtils.isEqual(props.state, this.props.state);
	},

	render: function render() {
		var state = this.props.state;

		var x = dataScale.toC(state.ds.x, state.position.x) - state.size;
		var y = dataScale.toC(state.ds.y, state.position.y) - state.size;
		var f = state.fill || state.color;

		return React.createElement('rect', { x: x, y: y, width: 2 * state.size, height: 2 * state.size, fill: f, opacity: state.shade, stroke: state.color, strokeWidth: state.width });
	}
});

module.exports = SquareMark;

},{"26":26,"33":33,"react":"react"}],52:[function(require,module,exports){
'use strict';

var utils = require(35);
var m = {};

m.VM = function (position, props, ds, key, pin) {

	var defSpan = {
		x: utils.isDate(position.x) ? utils.makePeriod({ months: 3 }) : 0.5,
		y: utils.isDate(position.y) ? utils.makePeriod({ months: 3 }) : 0.5
	};

	var draw = props.markProps.draw || position.draw || false;
	var color = position.color || props.markProps.color || props.markColor || props.color || 'black';
	var width = position.width || props.markProps.width || draw ? 1 : 0;
	var fill = position.fill || props.markProps.fill || color;
	var shade = position.shade || props.markProps.shade || 1;
	var span = position.span || props.span || defSpan;

	return {
		key: key,
		draw: draw,
		ds: ds,
		position: {
			x: position.x,
			y: position.y
		},
		drop: {
			x: position.drop.x,
			y: position.drop.y
		},
		span: span,
		color: color,
		width: width,
		fill: fill,
		shade: shade,
		pin: pin
	};
};

module.exports = m;

},{"35":35}],53:[function(require,module,exports){
'use strict';

var m = {};

m.VM = function (position, props, ds, key, pin, open) {

	var draw = props.markProps.draw || position.draw || false;
	var color = position.color || props.markProps.color || props.markColor || props.color || 'black';
	var width = position.width || props.markProps.width || open ? 1 : 0;
	var fill = open ? 'none' : position.fill || props.markProps.fill || color;
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
		shade: shade,
		pin: pin
	};
};

m.OVM = function (position, props, ds, key, pin) {
	props.markProps.draw = true;
	return m.VM(position, props, ds, key, pin, true);
};

module.exports = m;

},{}],54:[function(require,module,exports){
'use strict';

var space = require(33);

var angle = function angle(deg) {

	while (deg < 0) {
		deg += 360;
	}
	var span = 5;
	var v = Math.abs(deg - 90) < span || Math.abs(deg - 270) < span;

	return {
		rad: deg * Math.PI / 180,
		isVert: v,
		dir: v ? deg < 180 ? -1 : 1 : deg < 90 || deg > 270 ? 1 : -1
	};
};

// in fct so we don't compute if
// no tag
// tag = {
//   pin: true || false // show the line
//   pinHook:  // horizontal line
//   pinLength: // length to mark
//   print: // how to print
//   theta: // angle from mark
// }
var pin = function pin(pos, tag, ds) {
	// angle
	var ang = angle(tag.pinAngle);
	// anchor
	var anchor = {
		top: ang.isVert && ang.dir > 0,
		bottom: ang.isVert && ang.dir < 0,
		left: !ang.isVert && ang.dir > 0,
		right: !ang.isVert && ang.dir < 0
	};

	// mark
	var mpos = {
		x: space.toC(ds.x, pos.x),
		y: space.toC(ds.y, pos.y)
	};

	// pin length
	var pl = {
		x: Math.cos(ang.rad) * tag.pinLength,
		y: Math.sin(ang.rad) * tag.pinLength
	};

	// pin hook
	var ph = {
		x: ang.isVert ? 0 : ang.dir * tag.pinHook,
		y: ang.isVert ? ang.dir * tag.pinHook : 0
	};

	// position = mark + length + hook
	var lpos = {
		x: mpos.x + pl.x + ph.x,
		y: mpos.y - pl.y + ph.y
	};

	var lAnc = {
		x: lpos.x + (anchor.left ? 3 : -3),
		y: lpos.y + (anchor.top ? tag.fontSize : anchor.bottom ? -3 : 1)
	};

	var path = 'M ' + mpos.x + ',' + mpos.y + ' L ' + (mpos.x + pl.x) + ',' + (mpos.y - pl.y) + ' L ' + lpos.x + ',' + lpos.y;
	return {
		label: tag.print(pos.tag),
		labelAnc: anchor.top || anchor.bottom ? 'middle' : anchor.left ? 'start' : 'end',
		labelFS: tag.fontSize,
		x: lpos.x,
		y: lpos.y,
		xL: lAnc.x,
		yL: lAnc.y,
		path: !tag.pin ? null : path,
		pinColor: tag.pinColor,
		color: tag.color
	};
};

var m = function m(pos, tag, ds) {
	return tag.show ? pin(pos, tag, ds) : null;
};

module.exports = m;

},{"33":33}],55:[function(require,module,exports){
'use strict';

var m = {};

m.VM = function (position, props, ds, key, pin, open) {

	var draw = props.markProps.draw || position.draw || false;
	var color = position.color || props.markProps.color || props.markColor || props.color || 'black';
	var width = position.width || props.markProps.width || draw ? 1 : 0;
	var fill = open ? 'none' : position.fill || props.markProps.fill || color;
	var size = position.size || props.markProps.size || props.markSize || 3;
	var shade = position.shade || props.markProps.shade || 1;

	return {
		key: key,
		draw: draw,
		ds: ds,
		position: {
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

m.OVM = function (position, props, ds, key, pin) {
	props.markProps.draw = true;
	return m.VM(position, props, ds, key, pin, true);
};

module.exports = m;

},{}]},{},[15]);
