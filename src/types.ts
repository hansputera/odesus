import {type Slug} from './util';

export type Genre = {
	name: string;
	url: string;
};

export type AnimeStatus = 'ongoing' | 'completed' | 'unknown';

export type SearchResult = {
	name: string;
	image: string;
	genres: Genre[];
	url: string;
	rating?: number;
	status: AnimeStatus;
	getSlug?: () => Slug | undefined;
};

export type AnimeInformation = Exclude<SearchResult, 'getSlug'> & {
	synopsis: string;
	japaneseName: string;
	type: string;
	totalEpisodes: number;
	duration: string;
	studio: string;
	releasedAt: Date;
	producers: string;
};
