// global=describe,it
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
				done(Error('This shoud not be called'));
			}
		});
		t.on('my-event', function(e) {
			e.preventDefault();
		})
		t.fire('my-event');
		done();
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
				if (a.join('') == '123') {
					done();
				} else {
					done(Error('Callbacks not ordered: ' + a.join(',')));
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

describe('Broadcasting to GlobalTarget', function() {
	var t;
	beforeEach(function() {
		t = new EventTarget();
	});
	it('should bubble "broadcast" event to the GlobalTarget', function(done) {
		t.publish('wavehands', {
			broadcast: true
		});
		GlobalTarget.on('wavehands', function(e, who) {
			done();
		});
		t.fire('wavehands', 'long lost pal');
	});
	it('should not bubble normal event to the GlobalTarget', function(done) {
		GlobalTarget.on('shoutout', function(e) {
			done(Error("Event shoutout must not bubble to GlobalTarget"))
		})
		t.fire('shoutout');
		done();
	});
});

describe('Bubbling to other targets', function() {
	it('should bubble to added target', function(done) {
		var t = new EventTarget(),
			t2 = new EventTarget();
		t.addTarget(t2);
		t2.on('blow', function(e) {
			done();
		});
		t.fire('blow');
	});

	it('should NOT bubble to added target a stopped event', function(done) {
		var t = new EventTarget(),
			t2 = new EventTarget();
		t.addTarget(t2);
		t2.on('blow', function(e) {
			done(Error("Should not bubble here (stopped event)"));
		});
		t.on('blow', function(e) {
			e.stopPropagation();
		});
		t.fire('blow');
		done();
	});
})

describe('Attaching and detaching listeners', function() {
	it('should listen just once to an event', function(done) {
		var t = new EventTarget(),
			fires = 0;
		t.once('jump', function(e) { 
			fires += 1;
		});
		t.fire('jump');
		t.fire('jump');
		if (fires == 1) {
			done();
		} else {
			done(Error('Subscriber listened more than "once" (' + fires + ')'));
		}
	});
	it('should not listen to the event (listener detached with detach)', function(done) {
		var t = new EventTarget(),
			handler = t.on('my-event', function() {
				done(Error("This event should not be listened to"));
			});
		handler.detach();
		t.fire('my-event');
		done();
	});	
	it('should not listen to the event (listener detached with off)', function(done) {
		var t = new EventTarget(),
			fn = function() {
				done(Error("This event should not be listened to"));
			};
		t.on('my-event', fn);
		t.off('my-event', fn);
		t.fire('my-event');
		done();
	});	
})
