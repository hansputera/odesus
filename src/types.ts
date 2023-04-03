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
};
