const {createWriteStream} = require('fs');
const {Util, Odesus} = require('../dist');

const epUrl = 'https://otakudesu.lol/episode/rnsid8mnkwt-episode-12-sub-indo/';
const slug = Util.resolveSlug(epUrl);

new Odesus()
	.getEpisode(slug)
	.then(async res => {
		console.log(res);
		console.log(res.downloads);

		console.log(await res.getStreamUrl());

		const stream = await res.stream();
		stream.on('data', console.log);
		stream.on('end', () => {
			console.log('stream finished');
		});
		stream.pipe(createWriteStream('/tmp/video1.mp4'));
	});
