import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// Patch Notes issues: the Monday after the week they cover, when they are published.
				date: z.coerce.date().optional(),
			}),
		}),
	}),
	i18n: defineCollection({
		loader: i18nLoader(),
		schema: i18nSchema({
			extend: z.object({
				'decmp.backLink': z.string().optional(),
				'decmp.latestNotes': z.string().optional(),
				'decmp.allNotes': z.string().optional(),
				'decmp.noNotes': z.string().optional(),
				'decmp.rss': z.string().optional(),
			}),
		}),
	}),
};
