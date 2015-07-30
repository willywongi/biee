biee = require('./index');
EventTarget = biee.EventTarget;
GlobalTarget = biee.GlobalTarget;
t = new EventTarget()
t2 = new EventTarget()

t.publish('wavehands', {
	broadcast: true
});

GlobalTarget.on('wavehands', function(e, who) {
	console.log('Global: someone waved hands to %s', who);
});

t.publish('greet', {
	defaultFn: function() { console.log('t: Hello!'); },
});
t.on('greet', function(e) { console.log('t: To the world:'); })
t.fire('greet');

t.fire('wavehands', 'long lost pal');

t.addTarget(t2);
t.publish('welcome', {
	defaultFn: function(e, who) {
		console.log('t: Welcome here, %s!', who);
	}
});
t.on('welcome', function(e, who) {
	// prevent this event to bubble
	e.halted = true;
	if (who == 'badguy') {
		e.prevented = true;
	}
});
t2.on('welcome', function(e, who) {
	throw "t2: Event " + e.name + " should not bubble here";
});
t.fire('welcome', 'buddy');
t.fire('welcome', 'badguy');

t2.on('blow', function(e) { console.log('t2 is reacting to a bubbling event (%s)', e.name); });
t.fire('blow');

t.once('jump', function(e) { console.log('t: jump! (you should see this log just once)')});
t.fire('jump');
t.fire('jump');

var handler = t2.on('timeout', function() {
	throw "t2: timeout should not be listened to";
});

setTimeout(function() { handler.detach(); }, 500);
setTimeout(function() { t2.fire('timeout'); }, 1000);

var fn = function() { throw "I detached this listener" }
t.on('timeout', fn);
t.off('timeout', fn);
