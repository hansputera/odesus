import {type Readable} from 'stream';
import {type Slug} from './util';

export type Genre = {
	name: string;
	url: string;
};

export type AnimeStatus = 'ongoing' | 'completed' | 'unknown';
export type EpisodeResolution = '240p' | '360p' | '480p' | '720p' | '1080p';

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
	episodes: Array<{
		title: string;
		url: string;
		uploadedAt: Date;
	}>;
};

export type Batch = Pick<AnimeInformation, 'name' |
'totalEpisodes' |
'duration' |
'producers' |
'rating' |
'japaneseName' |
'studio' |
'url'
> & Pick<Episode, 'credit' | 'downloads'> & {
	aired: Date;
	genres: string[];
};

export type Episode = {
	title: string;
	postedBy: string;
	/**
	 * Local time
	 */
	releasedTime: string;
	url: string;
	downloads: Array<{
		resolution: EpisodeResolution;
		size: string;
		urls: Array<{
			source: string;
			url: string;
		}>;
	}>;
	credit: string;
	picture: string;
	mirrors: Array<{
		getNonceCode: () => Promise<string>;
		getMirrorUrl: () => Promise<string | undefined>;
		getStreamUrl: () => Promise<string | undefined>;
		stream: () => Promise<Readable>;
		resolution: string;
		source: string;
		// Encoded mirror payload (data content)
		_encoded: string;
	}>;
	/**
		Stream: () => Promise<Readable>;
		getStreamUrl: () => Promise<string | undefined>;
	*/
};
