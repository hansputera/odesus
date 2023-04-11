import {type Slug} from '@util';
import {load, type AnyNode} from 'cheerio';
import {type Gaxios} from 'gaxios';
import {type Batch} from '@typings';

import {$downloadHandle} from './get_episode';

type BatchState = Record<keyof Batch, Batch[keyof Batch]>;

const $batchSectionHandle = (index: number, el: AnyNode, state: BatchState) => {
	const $ = load(el);
	const value = $.text().trim();

	if (index % 2 === 0) {
		const keymaps = {
			japanese: 'japaneseName',
			studios: 'studio',
			duration: 'duration',
			type: 'type',
			judul: 'name',
			producers: 'producers',
			aired: 'aired',
			credit: 'credit',
			rating: 'rating',
			episodes: 'totalEpisodes',
		};
		const key = value.toLowerCase();
		const keyOnMap = Reflect.get(keymaps, key) as string;
		Reflect.set(state, '_key', keyOnMap);
		if (keyOnMap) {
			Reflect.set(state, keyOnMap, '');
		}
	} else {
		const savedKey = Reflect.get(state, '_key') as string;
		if (savedKey) {
			const valuer = value.replace(/:/g, '').trim();
			Reflect.set(state, savedKey, valuer);

			if (!isNaN(parseFloat(valuer)) && savedKey !== 'duration') {
				Reflect.set(state, savedKey, parseFloat(valuer));
			} else if (savedKey === 'aired') {
				Reflect.set(state, savedKey, new Date(valuer));
			} else if (savedKey === 'genres') {
				Reflect.set(state, savedKey, valuer.split(',').map(x => x.trim()));
			}

			Reflect.deleteProperty(state, '_key');
		}
	}
};

export const $batch = async (
	$client: Gaxios,
	slug: Slug,
): Promise<Batch | undefined> => {
	if (slug.type !== 'batch') {
		throw new TypeError('Invalid slug.type');
	}

	const response = await $client.request<string>({
		url: '/'.concat(slug.type, '/', encodeURIComponent(slug.slug)),
		follow: 0,
	});
	if (response.status !== 200) {
		return undefined;
	}

	const $ = load(response.data);

	const state: BatchState = {
		name: undefined,
		totalEpisodes: undefined,
		duration: undefined,
		producers: undefined,
		rating: 0,
		genres: [],
		japaneseName: undefined,
		studio: undefined,
		url: response.request.responseURL,
		credit: undefined,
		aired: undefined,
		downloads: $('.download2 .batchlink ul li').map((_, el) => $downloadHandle(el))
			.toArray(),
	};

	$('.infos').contents().filter((_, el) => $(el).text().trim().length > 1)
		.each((index, el) => {
			$batchSectionHandle(index, el, state);
		});

	return state as Batch;
};
