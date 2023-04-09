export type Slug = {
	type: OtakuSlugType;
	slug: string;
};
type OtakuSlugType = 'anime' | 'episode' | 'batch' | 'lengkap';

export const resolveSlug = (url: string): Slug | undefined => {
	try {
		const u = new URL(url).pathname.split('/')
			.filter(n => n.length);
		return {
			type: u[0] as OtakuSlugType,
			slug: u[1],
		};
	} catch {
		return undefined;
	}
};
