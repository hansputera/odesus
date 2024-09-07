import {type Day, type Schedule} from '@typings';
import {resolveSlug} from '@util';
import {load} from 'cheerio';
import {type Gaxios} from 'gaxios';

export const $scheduleMethod = async (
	$client: Gaxios,
): Promise<Schedule[]> => {
	const response = await $client.request<string>({
		url: '/jadwal-rilis',
	});

	const $ = load(response.data);
	const schedules = $('.kglist321').map((_, el) => ({
		day: $(el).find('h2').text().trim() as Day,
		animes: $(el).find('ul li').map((_, el) => ({
			name: $(el).find('a').text().trim(),
			url: $(el).find('a').attr('href') ?? '-',
			slug: resolveSlug($(el).find('a').attr('href') ?? '-'),
		})).toArray(),
	})).toArray<Schedule>();

	return schedules;
};
