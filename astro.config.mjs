// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const REPO = 'https://github.com/decmp/decmp.github.io';

/** A sidebar group whose label has a Spanish translation and whose pages come from one directory. */
const group = (label, es, directory, collapsed = false) => ({
	label,
	translations: { es },
	collapsed,
	items: [{ autogenerate: { directory } }],
});

export default defineConfig({
	site: 'https://learn.decmp.dev',
	trailingSlash: 'always',
	integrations: [
		starlight({
			title: 'decmp Learn',
			description: 'From first function to 100%: a guide to matching decompilation, by decmp.dev.',
			favicon: '/favicon.svg',
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
				es: { label: 'Español', lang: 'es' },
			},
			editLink: { baseUrl: `${REPO}/edit/main/` },
			lastUpdated: true,
			customCss: ['./src/styles/theme.css'],
			components: {
				SiteTitle: './src/components/SiteTitle.astro',
				SocialIcons: './src/components/SocialIcons.astro',
				Footer: './src/components/Footer.astro',
			},
			head: [
				{ tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
				{ tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' } },
				{
					tag: 'link',
					attrs: {
						rel: 'stylesheet',
						href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Silkscreen&display=swap',
					},
				},
				{
					tag: 'link',
					attrs: {
						rel: 'alternate',
						type: 'application/rss+xml',
						title: 'decmp Learn · Patch Notes',
						href: '/patch-notes/rss.xml',
					},
				},
			],
			sidebar: [
				group('Start here', 'Empieza aquí', 'start'),
				group('Platforms', 'Plataformas', 'platforms'),
				group('Matching', 'Matching', 'matching'),
				group('Track progress', 'Seguir el progreso', 'progress'),
				group('Contribute', 'Contribuir', 'contribute'),
				group('Patch Notes', 'Patch Notes', 'patch-notes', true),
				{ label: 'Glossary', translations: { es: 'Glosario' }, slug: 'glossary' },
			],
		}),
	],
});
