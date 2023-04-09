import {type Slug} from '@util';
import {load, type AnyNode} from 'cheerio';
import {type Gaxios} from 'gaxios';
import {type Batch} from '@typings';

import {$downloadHandle} from './get_episode';

const $batchSectionHandle = (index: number, el: AnyNode, state: Batch) => {
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

	// I'm lazy and later to fill this out.
	const state: Batch = {};
	const downloads = $('.download2 .batchlink ul li').map((_, el) => $downloadHandle(el))
		.toArray();

	$('.infos').contents().each((index, el) => {
		$batchSectionHandle(index, el, state);
	});

	return state;
};
