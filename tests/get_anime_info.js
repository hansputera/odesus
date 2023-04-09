const {Util, Odesus} = require('../dist');

const u = 'https://otakudesu.lol/anime/rougo-isekai-tamemasu-sub-indo/';
const resolved = Util.resolveSlug(u);

new Odesus().getAnimeInfo(resolved).then(console.log);
