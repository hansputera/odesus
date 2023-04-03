import gaxios from 'gaxios';

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
}
