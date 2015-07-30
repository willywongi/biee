# Browser Inspired Event Emitter

Yet Another Event Emitter. This API is heavily inspired by YUI EventTarget, which in turn, is borrowed by the browser:
Features default behaviour and bubble targets.

* on(evtName, callback)
* once(evtName, callback)
* fire(evtName, arg1, arg2, ...)
* off(evtName, callback)
* publish(evtName, {options})
* addTarget(anotherEventTarget)

The options for publish are:
* defaultFn: null, the function that will be called if the event cycle goes through the end,
* bubbles: false, whether or not this event bubbles,
* broadcast: false, whether or not the GlobalTarget is notified when the event is fired,
* preventable: true, whether or not preventDefault() has an effect

When a callback runs, it gets the event Facade as the first argument and any subsequent argument passed to fire.
The Facade object has this methods:
* preventDefault: Prevents the default behaviour
* stopPropagation: Stops the propagation of the event to the next bubble targets
* stopImmediatePropagation: For this particular event, no other listener will be called. Neither those attached on the same element, nor those attached on bubble targets. 