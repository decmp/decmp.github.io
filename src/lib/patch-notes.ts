import { getCollection } from 'astro:content';

/** Patch Notes issues, newest first. They are generated in English only, so only root-locale entries count. */
export async function patchNotes() {
	const entries = await getCollection(
		'docs',
		(entry) => entry.id.startsWith('patch-notes/') && entry.data.date !== undefined,
	);
	return entries.sort((a, b) => b.data.date!.getTime() - a.data.date!.getTime());
}
