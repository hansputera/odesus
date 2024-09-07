import {Odesus} from '../dist/index.js';

const odesu = new Odesus();

odesu.getSchedules().then(res => {
	res.forEach(schedule => console.log(schedule.day, schedule.animes));
});
