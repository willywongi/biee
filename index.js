var owns = function(obj, key) {
		return {}.hasOwnProperty.call(obj, key);
	},
	setDefault = function(obj, key, value) {
		/* If key is not set in obj, set to value and return value;
			otherwise just return value */
		if (! owns(obj, key)) {
			obj[key] = value;
		}
		return obj[key];
	},
	emptyFn = function() {};

function Facade(name, target, args) {
	this.name = name;
	this.target = target;
	this.args = args;
	
	this._stopped = false;  // for default behaviour
	this._halted = false;  // for subsequent listeners & bubble targets
}

/* Prevents the default behaviour
 */
Facade.prototype.preventDefault = function() {
	this._stopped = true;
}
/* Stops the propagation of the event to the next bubble targets.
*/
Facade.prototype.stopPropagation = function() {
	this._halted = true;
}

/* For this particular event, no other listener will be called.
	Neither those attached on the same element, nor those attached on 
	bubble targets. 
 */
Facade.prototype.stopImmediatePropagation = function() {
	this.stopPropagation();
}


function ET() {}

var GT = new ET();

/* Prepare to a certain event:
	options = {
		defaultFn: null, the function that will be called if the event cycle goes through the end,
		bubbles: false, whether or not this event bubbles,
		broadcast: false, whether or not the GlobalTarget is notified when the event is fired,
		preventable: true, whether or not preventDefault() has an effect
	} */
ET.prototype.publish = function(evtName, options) {
	var evt = {};
	if (owns(options, 'defaultFn')) {
		evt.defaultFn = options.defaultFn;
	}
	if (owns(options, 'broadcast')) {
		evt['broadcast'] = options.broadcast;
	}
	evt['preventable'] = (owns(options, 'preventable')) ? options.preventable : true;
	this._getEvents()[evtName] = evt;
};

ET.prototype._getEvent = function(evtName) {
	return setDefault(this._getEvents(), evtName, {})
}

/* Returns an array with registered callbacks for the given event
*/
ET.prototype.getSubs = function(evtName) {
	return setDefault(this._getEvent(evtName), 'subscribers', []);
};

/* React (callback) to a certain event (evtName). Returns an object with the method "detach" (same as et.off)
	Subscribers can alter the flow of the event tampering with the facade:
	et.on('hello', function(e) {
		e.stopped = 1; // blocks all subsequent subscribers.
		e.prevented = 1; // blocks the defaultFn (if the event is preventable)
		e.halted = 1;  // blocks bubbling
	});
*/
ET.prototype.on = function(evtName, callback) {
	var subs = this.getSubs(evtName);
	subs.push(callback);
	return {
		detach: this.off.bind(this, evtName, callback)
	}
};

/* Remove a callback from a certain event (evtName) */
ET.prototype.off = function(evtName, callback) {
	var subs = this.getSubs(evtName);
	subs.splice(subs.indexOf(callback), 1);
};

/* React just once to the given event */
ET.prototype.once = function(evtName, callback) {
	var ec = this.on(evtName, callback);
	this.on(evtName, function() {
		ec.detach();
	});
	return ec;
};

/* Add a bubbling target to this target.
	All events fired on this will fire also on the bubbling targets.
*/
ET.prototype.addTarget = function(target) {
	var targets = setDefault(this, '_bubblingTargets', []);
	if (target !== this && target._receiveBubble && targets.indexOf(target) < 0) {
		// Looks like a valid bubbling target
		targets.push(target);
	}
};

/* Fire a certain event. Subscribers will be called with the event facade as first argument and any subsequent argument
	passed here.
*/
ET.prototype.fire = function(evtName /*[args, ...]*/ ) {
	var args = Array.prototype.slice.call(arguments, 1),
		facade = new Facade(evtName, this, args);
	args.unshift(facade);
	this._fire(facade);
};

ET.prototype._getEvents = function() {
	return setDefault(this, '_events', {});
}
ET.prototype._call = function(sub, args) {
	sub.apply(this, args);
}
ET.prototype._fire = function(facade) {
	var events = this._getEvents(),
		targets = setDefault(this, '_bubblingTargets', []),
		args = facade.args,
		evtName = facade.name,
		broadcast,
		defaultFn;
	// if evtName is not in _events, no subscribers are there.
	if (owns(events, evtName)) {
		var evt = events[evtName],
			subs = evt.subscribers || [];
		broadcast = evt.broadcast;
		defaultFn = evt.defaultFn;
		// call the subscribers
		for (var i = 0, j = subs.length; i<j; i++) {
			if (facade._halted) {
				break;
			}
			this._call(subs[i], args, facade);
		}
	}
	// call the bubble targets
	for (var i = 0, j = targets.length; i<j; i++) {
		if (facade._halted) {
			break;
		}
		targets[i]._receiveBubble(facade);
	}
	if (! facade._halted && broadcast) {
		GT._receiveBubble(facade);
	}
	if (defaultFn && (!evt.preventable || !facade._stopped)) {
		/* if no subscriber has prevented the event, run the defaultFn (if any)*/
		this._call(defaultFn, args, facade);
	}
}
/* Fire the same event on this target. Receive the event facade from the original event target.
*/
ET.prototype._receiveBubble = function(facade) {
	this._fire(facade);
}

exports.EventTarget = ET;
exports.GlobalTarget = GT;
