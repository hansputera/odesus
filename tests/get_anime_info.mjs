import {Util, Odesus} from '../dist/index.js';

const u = 'https://otakudesu.cam/anime/rougo-isekai-tamemasu-sub-indo/';
const resolved = Util.resolveSlug(u);

new Odesus().getAnimeInfo(resolved).then(console.log);
