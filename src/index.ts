import {$batch} from '@methods/batch';
import {$getAnimeInformation} from '@methods/get_anime_info';
import {$getEpisode} from '@methods/get_episode';
import {$searchMethod} from '@methods/search';

import {type Episode, type AnimeInformation, type SearchResult, type Batch} from '@typings';
import {type Slug} from '@util';
import * as gaxios from 'gaxios';

/**
 * @class Odesus
 */
export class Odesus {
	public client!: gaxios.Gaxios;
	/**
     * @constructor
     * @param baseUrl Otakudesu Base URL
     */
	constructor(baseUrl = 'https://otakudesu.lol') {
		gaxios.instance.defaults = {
			baseUrl,
			headers: {
				'User-Agent': 'Odesus/1.0',
			},
		};

		this.client = gaxios.instance;
	}

	/**
     * Search animes
     * @param query Search query
     * @return {SearchResult[]}
     */
	async search(query: string): Promise<SearchResult[]> {
		return $searchMethod(this.client, query);
	}

	/**
	 * Get anime information
	 * @param {Slug} slug Anime slug
	 * @return {Promise<AnimeInformation | undefined>}
	 */
	async getAnimeInfo(slug: Slug): Promise<AnimeInformation | undefined> {
		return $getAnimeInformation(this.client, slug);
	}

	/**
	 * Get episode information
	 * @param {Slug} slug Episode slug
	 * @return {Promise<Episode | undefined>}
	 */
	async getEpisode(slug: Slug): Promise<Episode | undefined> {
		return $getEpisode(this.client, slug);
	}

	/**
	 * Get batch information
	 * @param {Slug} slug Batch slug
	 * @return {Promise<Batch | undefined>}
	 */
	async batch(slug: Slug): Promise<Batch | undefined> {
		return $batch(this.client, slug);
	}
}

export * as Util from './util';
export * as Types from './types';
