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

export const $mirrorHandle = (el: Element): Episode['mirrors'][0] | undefined => {
	const $ = load(el);

	const encoded = $('a').attr('data-content');
	if (!encoded) {
		return undefined;
	}

	const jsonEncoded = JSON.parse(atob(encoded)) as {
		id: number;
		i: number;
		q: string;
	};

	return {
		source: $('a').text().trim(),
		resolution: jsonEncoded.q,
		_encoded: encoded,
		async getNonceCode(): Promise<string> {
			const response = await gaxios.request<{
				data: string;
			}>({
				url: '/wp-admin/admin-ajax.php',
				method: 'POST',
				data: new URLSearchParams({
					action: 'aa1208d27f29ca340c92c66d1926f13f',
				}).toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			return response.data.data;
		},
		async getMirrorUrl(nonce?: string): Promise<string | undefined> {
			if (!nonce) {
				nonce = await this.getNonceCode();
			}

			const response = await gaxios.request<{
				data: string;
			}>({
				url: '/wp-admin/admin-ajax.php',
				method: 'POST',
				data: new URLSearchParams({
					q: jsonEncoded.q,
					i: jsonEncoded.i.toString(),
					id: jsonEncoded.id.toString(),
					action: '2a3505c93b0035d3f455df82bf976b84',
					nonce,
				}).toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			const $ = load(atob(response.data.data));
			return $('iframe').attr('src');
		},
		async getStreamUrl(): Promise<string | undefined> {
			const frameUrl = await this.getMirrorUrl();
			if (!frameUrl) {
				return undefined;
			}

			const response = await gaxios.request<string>({
				url: frameUrl,
				baseUrl: '',
			});
			if (response.status !== 200) {
				throw new Error('Unexpected Response#status from frameUrl');
			}

			const streamUrl = /(?:'|")file(?:'|"):(?:'|")(.+)(?:'|")(?:,)/gi
				.exec(response.data)
					?? /\[{'file':'(.+)','type/gi.exec(response.data);

			return streamUrl?.at(1) ?? undefined;
		},
		async getStreamFileSize(): Promise<number | undefined> {
			const streamUrl = await this.getStreamUrl();
			if (!streamUrl?.length) {
				return undefined;
			}

			const response = await gaxios.request({
				url: streamUrl,
				baseUrl: '',
				method: 'HEAD',
			});

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			return parseInt(response.headers['content-length'] ?? '0', 10);
		},
		async stream(options?: gaxios.GaxiosOptions): Promise<Readable> {
			const streamUrl = await this.getStreamUrl();
			if (!streamUrl?.length) {
				throw new Error('Fail to extract the streamUrl');
			}

			const state = {
				downloadedChunks: 0,
				fileSize: await this.getStreamFileSize(),
			};

			if (!state.fileSize) {
				throw new Error('Fail to extract the file size');
			}

			const response = await gaxios.request<Readable>({
				method: 'GET',
				url: streamUrl,
				baseUrl: '',
				responseType: 'stream',
				...options,
			});

			response.data.on('data', chunk => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				state.downloadedChunks += Buffer.from(chunk).length;
				response.data.emit('progress', {
					downloaded: state.downloadedChunks,
					total: state.fileSize!,
					progress: (state.downloadedChunks / state.fileSize!) * 100,
				});
			});

			return response.data;
		},
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

	return {
		title: $('h1.posttl').text().trim(),
		postedBy: $('.kategoz span').eq(0).text().replace(/posted by/gi, '').trim(),
		releasedTime: $('.kategoz span').eq(1).text().replace(/release on/gi, '').trim(),
		downloads: $('.download ul li').map((_, el) => $downloadHandle(el)).toArray(),
		url: response.request.responseURL,
		picture: $('.cukder img.wp-post-image').attr('src') ?? '-',
		credit: $('.infozingle p').eq(0).text().trim(),
		mirrors: $('.mirrorstream ul li').map((_, el) => $mirrorHandle(el)).toArray(),
	};
};
