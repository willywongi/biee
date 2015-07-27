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


function ET() {}

var GT = new ET();

ET.prototype._getEvents = function() {
	return setDefault(this, '_events', {});
}
ET.prototype.getSubscribers = function(evtName) {
	var events = this._getEvents();
	return setDefault(setDefault(events, evtName, {}), 'subscribers', []);
};
ET.prototype.on = function(evtName, callback) {
	/* React (callback) to a certain event (evtName).
		Subscribers can alter the flow of the event tampering with the facade:
		et.on('hello', function(e) {
			e.stopped = 1; // blocks all subsequent subscribers.
			e.prevented = 1; // blocks the defaultFn.
		});
	*/
	var subs = this.getSubscribers(evtName);
	subs.push(callback);
};
ET.prototype.off = function(evtName, callback) {
	var subs = this.getSubscribers(evtName);
	subs.splice(subs.indexOf(callback), 1);
};
ET.prototype._call = function(sub, args) {
	sub.apply(this, args);
}
ET.prototype.fire = function(evtName /*[args, ...]*/ ) {
	/* Fire a certain event. Subscribers will be called with
		the event facade as first argument and any subsequent argument passed here. */
	var args = Array.prototype.slice.call(arguments, 1),
		events = this._getEvents();
	// if evtName is not in _events, no subscribers are there.
	if (owns(events, evtName)) {
		var evt = events[evtName],
			subs = evt.subscribers || [],
			targets = evt.targets || [],
			facade = {
				name: evtName,
				args: args,
				target: this
			};
		args.unshift(facade);
		for (var i = 0, j = subs.length; i<j; i++) {
			this._call(subs[i], args, facade);
			if (facade.stopped) {
				break;
			}
		}
		for (var i = 0, j = targets.length; i<j; i++) {
			targets[i].fire.call(targets[i], arguments);
		}
		if (! facade.prevented && evt.defaultFn) {
			/* if no subscriber has prevented the event, run the defaultFn (if any)*/
			this._call(evt.defaultFn, args, facade);
		}
	}
};
ET.prototype.publish = function(evtName, options) {
	/* Prepare to a certain event:
		options = {
			defaultFn: the function that will be called if the event cycle goes through the end,
			global: auto bubble to GlobalTarget
		} */
	var evt = {};
	if (owns(options, 'defaultFn')) {
		evt.defaultFn = options.defaultFn;
	}
	if (owns(options, 'targets')) {
		evt.targets = options.targets;
	} else {
		evt.targets = []
	}
	if (owns(options, 'global')) {
		evt.targets.push(GT);
	}
	this._getEvents()[evtName] = evt;
};

exports.EventTarget = ET;
exports.GlobalTarget = GT;
