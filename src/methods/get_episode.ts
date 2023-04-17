import {type Episode} from '@typings';
import {type Slug} from '@util';
import {type Element, load} from 'cheerio';
import * as gaxios from 'gaxios';
import {type Readable} from 'stream';

// Ref: https://stackoverflow.com/a/67583500/21549146
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
export type FlattedEpisode = Flatten<Episode['downloads']>;

export const $downloadHandle = (el: Element): FlattedEpisode => {
	const $ = load(el);

	const $urlHandle = (el: Element): Flatten<FlattedEpisode['urls']> => ({
		url: el.attribs.href,
		source: load(el).text().trim(),
	});

	return {
		resolution: $('strong').text().trim() as FlattedEpisode['resolution'],
		size: $('i').text().trim(),
		urls: $('a').map((_, el) => $urlHandle(el)).toArray(),
	};
};

export const $getEpisode = async (
	$client: gaxios.Gaxios,
	slug: Slug,
): Promise<Episode | undefined> => {
	if (slug.type !== 'episode') {
		throw new TypeError('Invalid slug.type');
	}

	const response = await $client.request<string>({
		url: '/'.concat(slug.type, '/', encodeURIComponent(slug.slug)),
	});

	if (response.status !== 200) {
		return undefined;
	}

	const $ = load(response.data);
	const frameUrl = $('#lightsVideo iframe').attr('src') ?? '-';
	const getStreamUrl = async () => {
		const response = await gaxios.request<string>({
			url: frameUrl,
			baseUrl: '',
		});
		if (response.status !== 200) {
			throw new Error('Unexpected Response#status from frameUrl');
		}

		const re = /\[{'file':'(.+)','type/gi;
		const streamUrl = re.exec(response.data);

		return streamUrl?.at(1) ?? undefined;
	};

	return {
		title: $('h1.posttl').text().trim(),
		postedBy: $('.kategoz span').eq(0).text().replace(/posted by/gi, '').trim(),
		releasedTime: $('.kategoz span').eq(1).text().replace(/release on/gi, '').trim(),
		downloads: $('.download ul li').map((_, el) => $downloadHandle(el)).toArray(),
		url: response.request.responseURL,
		iframeStreamUrl: frameUrl,
		getStreamUrl,
		async stream() {
			if (frameUrl === '-') {
				throw new Error('Unexpected frameUrl');
			}

			const streamUrl = await getStreamUrl();
			if (!streamUrl?.length) {
				throw new Error('Fail to extract the streamUrl');
			}

			return (await gaxios.request<Readable>({
				url: streamUrl[1],
				responseType: 'stream',
				baseUrl: '',
			})).data;
		},
		picture: $('.cukder img.wp-post-image').attr('src') ?? '-',
		credit: $('.infozingle p').eq(0).text().trim(),
	};
};
