const {Util, Odesus} = require('../dist');

const epUrl = 'https://otakudesu.lol/episode/rnsid8mnkwt-episode-12-sub-indo/';
const slug = Util.resolveSlug(epUrl);

new Odesus()
	.getEpisode(slug)
	.then(async res => {
		console.log(res);
		console.log(res.downloads);

		const stream = await res.stream();
		stream.on('data', console.log);
	});
