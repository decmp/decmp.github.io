import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { patchNotes } from '../../lib/patch-notes';

export async function GET(context: APIContext) {
	const issues = await patchNotes();
	return rss({
		title: 'decmp Learn · Patch Notes',
		description: 'A weekly digest of decompilation progress tracked on decmp.dev.',
		site: context.site!,
		items: issues.map((issue) => ({
			title: issue.data.title,
			pubDate: issue.data.date,
			description: issue.data.description,
			link: `/${issue.id}/`,
		})),
		customData: '<language>en</language>',
	});
}
