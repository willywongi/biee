# Browser Inspired Event Emitter

Yet Another Event Emitter. This API is heavily inspired by how browser events
behave. With this first version this is the API:

* on(evtName, callback)
* fire(evtName, arg1, arg2, ...)
* off(evtName, callback)
* publish(evtName, {options})

The options for publish are:
* defaultFn: a method that will be called after all the "on" subscribers
* targets: other EventTargets where this event will bubble
* global: bubbles to the Global Event Target.
