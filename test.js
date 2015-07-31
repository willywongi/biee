var biee = require('./index');
var EventTarget = biee.EventTarget;
var GlobalTarget = biee.GlobalTarget;
var t = new EventTarget()
var t2 = new EventTarget()

describe('Callbacks', function() {
	var t;
	beforeEach(function() {
		t = new EventTarget();
	});
	it('should call my callback', function(done) {
		t.on('my-event', function(e) {
			done();
		});
		t.fire('my-event');
    });
	it('should call my callback with my args', function(done) {
		t.on('my-event', function(e, a, b, c) {
			if (a == 1 && b == 'ciao' && c == null) {
				done();
			}
		});
		t.fire('my-event', 1, 'ciao', null);
	});
});

describe('Default behaviour', function() {
	var t;
	beforeEach(function() {
		t = new EventTarget();
	});
	it('should run the event\'s default function', function(done) {
		t.publish('my-event', {
			defaultFn: function(e) {
				done();
			}
		});
		t.fire('my-event');
	});
	it('should NOT run the event\'s default function (blocked by a subscriber)', function(done) {
		t.publish('my-event', {
			defaultFn: function(e) {
				done('This shoud not be called');
			}
		});
		t.on('my-event', function(e) {
			e.preventDefault();
		})
		t.fire('my-event');
	})
	it('should run the event\'s unpreventable default function', function(done) {
		t.publish('my-event', {
			defaultFn: function(e) {
				done();
			},
			preventable: false
		});
		t.on('my-event', function(e) {
			e.preventDefault();
		});
		t.fire('my-event');
	});
});

describe('Callbacks and default behaviour', function() {
	var t;
	beforeEach(function() {
		t = new EventTarget();
	});
	it('should run the event\'s callbacks and default function, in order', function(done) {
		var a = []
		t.publish('my-event', {
			defaultFn: function(e) {
				a.push(3);
				if (a == [1, 2, 3]) {
					done();
				} else {
					done({
						'message': 'Callbacks not ordered',
						'callbacks': a
					})
				}
				
			}
		});
		t.on('my-event', function(e) {
			a.push(1);
		});
		t.on('my-event', function(e) {
			a.push(2);
		});
		t.fire('my-event');
	});
	
})

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
	e.stopPropagation();
	if (who == 'badguy') {
		e.preventDefault();
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

t.publish('run', {
	defaultFn: function() {
		console.log("t: runs and it's unstoppable");
	},
	preventable: false
});

t.on('run', function(e) { e.preventDefault(); });
t.fire('run');
