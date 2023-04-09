const {Odesus} = require('../dist');

const odesu = new Odesus();
odesu.search('Bor').then(r => {
	const item = r[0];
	console.log(item);
});
