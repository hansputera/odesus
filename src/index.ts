import {$searchMethod} from '@methods/search';
import {type SearchResult} from '@typings';
import * as gaxios from 'gaxios';

/**
 * @class Odesus
 */
export class Odesus {
	protected client!: gaxios.Gaxios;
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
}
