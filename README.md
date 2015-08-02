# Browser Inspired Event Emitter

Yet Another Event Emitter. This API is heavily inspired by YUI EventTarget, which in turn, is borrowed by the browser:
Features default behaviour and bubble targets.

* `on(evtName, callback)`: `callback` will be invoked whenever the event `evtName` fires.
* `once(evtName, callback)`: `callback` will be invoked just once, when the event `evtName` fires.
* `fire(evtName, arg1, arg2, ...)`: Fires the event `evtName`. Subsequent arguments will be passed to subscribed callbacks.
* `off(evtName, callback)`: Removes `callback` from the subscribers.
* `publish(evtName, {options})`: Lets you prepare some options for the given event (see below).
* `addTarget(anotherEventTarget)`: Adds another event target. Events fired on the first target will "bubble up" to the added event target.

The options for publish are (option: default):
* `defaultFn`: null, the function that will be called if the event cycle goes through the end,
* `broadcast`: false, whether or not the GlobalTarget is notified when the event is fired,
* `preventable`: true, whether or not preventDefault() has an effect

When a callback runs, it gets the event Facade as the first argument and any subsequent argument passed to fire.
The Facade object has this methods:
* `preventDefault`: Prevents the default behaviour
* `stopPropagation`: Stops the propagation of the event to the next bubble targets
* `stopImmediatePropagation`: For this particular event, no other listener will be called. Neither those attached on the same element, nor those attached on bubble targets.

Example:
```javascript
var EventTarget = require('biee').EventTarget,
	t = new EventTarget();

// subscribe, fire an event with a single argument
t.on('greet', function(e, who) {
	console.log('Greetings, ' + who + '!');
});
t.fire('greet', 'Anna');

// publish an event with a default behaviour, listeners can prevent it.
t.publish('wavehands', function(e, who) {
	moveArmTowards(who);
});
t.on('wavehands', function(e, who) {
	if (who == 'someBadGuy') {
		e.preventDefault();
	}
});
t.fire('wavehands', 'someNiceGuy');
t.fire('wavehands', 'someBadGuy');

// add a bubbling target
var t2 = new EventTarget();
t.addTarget(t2);
t2.on('greet', function(e, who) {
	console.log('Cheers from t2 too!');
});
```

 