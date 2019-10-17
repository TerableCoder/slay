module.exports = function drop(mod) {
	mod.game.initialize(["me"]);

	let location = null,
		locRealTime = 0,
		curHp = 0n,
		maxHp = 0n;

	mod.hook('S_PLAYER_STAT_UPDATE', 13, event => {
		curHp = event.hp;
		maxHp = event.maxHp;
	});

	mod.hook('S_CREATURE_CHANGE_HP', 6, event => {
		if(mod.game.me.is(event.target)){
			curHp = event.curHp;
			maxHp = event.maxHp;
		}
	});

	mod.hook('C_PLAYER_LOCATION', 5, event => {
		location = event;
		locRealTime = Date.now();
	});

	mod.command.add(['drop', 'slay', 'slaying'], percent => {
		percent = Number(percent);

		if(!(percent > 0 && percent <= 100) || !curHp) return;

		const percentToDrop = Number(curHp * 100n / maxHp) - percent;

		if(percentToDrop <= 0) return;

		mod.send('C_PLAYER_LOCATION', 5, Object.assign({}, location, {
			loc: location.loc.addN({z: 400 + percentToDrop*(mod.game.me.race =='castanic' ? 20 : 10)}),
			type: 2,
			time: location.time - locRealTime + Date.now() - 50
		}));
		mod.send('C_PLAYER_LOCATION', 5, Object.assign(location, {
			type: 7,
			time: location.time - locRealTime + Date.now() + 50
		}));
	});
}