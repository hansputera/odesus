import {createWriteStream} from 'fs';
import {Util, Odesus} from '../dist/index.js';

const epUrl = 'https://otakudesu.cam/episode/rnsid8mnkwt-episode-12-sub-indo/';
const slug = Util.resolveSlug(epUrl);

new Odesus()
	.getEpisode(slug)
	.then(async res => {
		console.log(res);
		console.log(res.downloads);

		console.log(res.mirrors);
		console.log(await res.mirrors[0].getMirrorUrl());
		console.log(await res.mirrors[0].getStreamUrl());
		console.log(await res.mirrors[0].getStreamFileSize());

		const stream = await res.mirrors[0].stream();
		stream.on('progress', console.log);
		stream.on('end', () => {
			console.log('stream finished');
		});
		stream.pipe(createWriteStream('/tmp/video1.mp4'));
	});
