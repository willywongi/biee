EventTarget = require('./index').EventTarget;
t = new EventTarget()
t.publish('greet', {defaultFn: function() { console.log('Hello!'); }})
t.on('greet', function(e) { console.log('To the world:'); })
t.fire('greet');

t.publish('welcome', {
	defaultFn: function(e, who) {
		console.log('Welcome here, %s!', who);
	}
});

t.on('welcome', function(e, who) {
	if (who == 'badguy') {
		e.prevented = true;
	}
});

t.fire('welcome', 'buddy');
t.fire('welcome', 'badguy');
