import {type Slug} from '@util';
import {load, type AnyNode} from 'cheerio';
import {type Gaxios} from 'gaxios';
import {type Batch} from '@typings';

import {$downloadHandle} from './get_episode';

type BatchState = Record<keyof Batch, Batch[keyof Batch]>;

const $batchSectionHandle = (index: number, el: AnyNode, state: BatchState) => {
	const $ = load(el);

	if (index % 2 === 0) {
		const keymaps = {
			japanese: 'japaneseName',
			studios: 'studio',
			durasi: 'duration',
			status: 'status',
			type: 'type',
			judul: 'name',
			produser: 'producers',
		};
		const key = $.text().trim().toLowerCase();
		const keyOnMap = Reflect.get(keymaps, key) as string;
		if (keyOnMap) {
			Reflect.set(state, '_key', keyOnMap);
			Reflect.set(state, keyOnMap, '');
		}
	} else {
		const savedKey = Reflect.get(state, '_key') as string;
		if (savedKey) {
			const value = $.text().trim().toLowerCase();
			Reflect.set(state, savedKey, value);
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
		rating: undefined,
		genres: undefined,
		status: undefined,
		japaneseName: undefined,
		studio: undefined,
		url: undefined,
		credit: undefined,
		aired: undefined,
		downloads: $('.download2 .batchlink ul li').map((_, el) => $downloadHandle(el))
			.toArray(),
	};

	$('.infos').contents().each((index, el) => {
		$batchSectionHandle(index, el, state);
	});

	return state as Batch;
};
