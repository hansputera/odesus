import {type AnimeStatus, type Genre, type SearchResult} from '@typings';
import {type Gaxios} from 'gaxios';
import {load, type Element} from 'cheerio';
import {resolveSlug} from '@util';

const $liMapHandle = (el: Element): SearchResult => {
	const $ = load(el);
	const $genreHandle = (el: Element): Genre => {
		const $ = load(el);

		return {
			name: $.text().trim(),
			url: el.attribs.href,
		};
	};

	return {
		image: $('img').attr('src')!,
		name: $('h2').text().trim(),
		url: $('h2 a').attr('href')!,
		genres: $('div').eq(0).find('a').map((_, el) => $genreHandle(el)).toArray(),
		status: $('div').eq(1).eq(0).text()
			.replace(/(status|\s+|:)/gi, '').trim().toLowerCase() as AnimeStatus,
		rating: parseFloat($('div').eq(2).eq(0).text()
			.replace(/(rating|\s+|:)/gi, '').trim()) ?? 0,
		getSlug: () => resolveSlug($('h2 a').attr('href')!),
	};
};

export const $searchMethod = async (
	$client: Gaxios,
	query: string,
): Promise<SearchResult[]> => {
	const response = await $client.request<string>({
		url: '/',
		params: {
			s: encodeURIComponent(query),
			// eslint-disable-next-line @typescript-eslint/naming-convention
			post_type: 'anime',
		},
	});

	if (response.status === 200) {
		const $ = load(response.data);

		if (!$('ul.chivsrc li').length) {
			return [];
		}

		return $('ul.chivsrc li').map((_, el) => $liMapHandle(el)).toArray<SearchResult>();
	}

	return [];
};
