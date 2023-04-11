import {type Gaxios} from 'gaxios';
import {type Slug} from '@util';
import {type Element, load} from 'cheerio';
import {type Genre, type AnimeInformation} from '@typings';

type State = AnimeInformation;

const $sectionHandler = async (el: Element, state: State) => {
	const $ = load(el);

	const $genreHandle = (el: Element): Genre => ({
		name: load(el).text(),
		url: el.attribs.href,
	});

	const [key, value] = [
		$('b').text().trim().toLowerCase(),
		$('span').contents().eq(1).text().replace(/:/g, '').trim(),
	];

	const unhandledMaps = {
		japanese: 'japaneseName',
		studio: 'studio',
		durasi: 'duration',
		status: 'status',
		tipe: 'type',
		judul: 'name',
		produser: 'producers',
	};
	if (key === 'tanggal rilis') {
		Reflect.set(state, 'releasedAt', new Date(value));
	} else if (key === 'total episode') {
		Reflect.set(state, 'totalEpisodes', value === '?' ? 0 : parseInt(value, 10));
	} else if (key === 'skor') {
		Reflect.set(state, 'rating', parseFloat(value));
	} else if (key === 'genre') {
		Reflect.set(state, 'genres', $('a').map((_, el) => $genreHandle(el)).toArray());
	} else {
		const mapKey = Reflect.get(unhandledMaps, key) as string;
		if (mapKey) {
			Reflect.set(state, mapKey, value);
		}
	}
};

export const $episodeHandle = (el: Element): {
	title: string;
	url: string;
	uploadedAt: Date;
} => {
	const $ = load(el);
	return {
		title: $('a').text().trim(),
		url: $('a').attr('href')!,
		uploadedAt: new Date($('.zeebr').text().trim()),
	};
};

export const $getAnimeInformation = async (
	$client: Gaxios,
	slug: Slug,
): Promise<AnimeInformation | undefined> => {
	if (slug.type !== 'anime') {
		throw new TypeError('Invalid slug.type');
	}

	const response = await $client.request<string>({
		method: 'GET',
		url: '/'.concat(slug.type as string, '/', encodeURIComponent(slug.slug)),
	});
	if (response.status !== 200) {
		return undefined;
	}

	const $ = load(response.data);
	if (/anime archive/gi.test($('title').text().trim())) {
		return undefined;
	}

	const state: State = {
		name: '',
		image: $('img.wp-post-image').attr('src') ?? '-',
		genres: [],
		url: response.request.responseURL,
		rating: 0,
		status: 'unknown',
		synopsis: $('.sinopc').text().trim(),
		japaneseName: '',
		type: '',
		totalEpisodes: 0,
		duration: '',
		studio: '',
		releasedAt: new Date(),
		producers: '',
		episodes: $('.episodelist ul li').map((_, el) => $episodeHandle(el)).toArray(),
	};
	// Tag 'p' handlers
	await Promise.all(
		$('.infozingle p').map(async (_, el) => $sectionHandler(el, state)).toArray(),
	);
	return state;
};
