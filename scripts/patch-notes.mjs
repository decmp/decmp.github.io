#!/usr/bin/env node
// Writes one Patch Notes issue: a digest of decmp.dev progress over one ISO week.
//
//   node scripts/patch-notes.mjs [--week 2026-W41] [--api https://api.decmp.dev] [--no-cache]
//
// Without --week it covers the last completed ISO week (UTC). The issue goes to
// src/content/docs/patch-notes/YYYY-Www.md; re-running for the same week overwrites that file.
// The API is read gently: index.json once (cached on disk for a few hours), then, one request at a time,
// the history of each project that reported since the day before the week started. Any failed request
// aborts the run before anything is written.

import { createHash } from 'node:crypto';
import { appendFile, mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'src/content/docs/patch-notes');
const CACHE_DIR = join(ROOT, '.cache');
const INDEX_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 30_000;
const PAUSE_MS = 150;
const DAY_MS = 24 * 60 * 60 * 1000;

const SITE = (process.env.DECMP_SITE || 'https://decmp.dev').replace(/\/$/, '');
const CHECKPOINTS = [25, 50, 75, 90];
const TOP = 10;

// Console ids as decmp.dev stores them (packages/decomp-api/src/game.ts in the decmp repo).
const PLATFORMS = {
	gbc: 'Game Boy Color',
	n64: 'Nintendo 64',
	ps: 'PlayStation',
	gba: 'Game Boy Advance',
	gc: 'GameCube',
	ps2: 'PlayStation 2',
	xbox: 'Xbox',
	nds: 'Nintendo DS',
	psp: 'PlayStation Portable',
	xbox360: 'Xbox 360',
	wii: 'Wii',
	'3ds': 'Nintendo 3DS',
	switch: 'Nintendo Switch',
	win32: 'Windows',
};

const { values: args } = parseArgs({
	options: {
		week: { type: 'string', default: process.env.PATCH_NOTES_WEEK || '' },
		api: { type: 'string', default: process.env.DECMP_API || 'https://api.decmp.dev' },
		'no-cache': { type: 'boolean', default: false },
	},
});
const API = args.api.replace(/\/$/, '');

// ---- ISO weeks (UTC) ----

/** The Monday 00:00 UTC that starts the ISO week holding `date`. */
function mondayOf(date) {
	const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
	return new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * DAY_MS);
}

/** ISO year and week number of the week that starts on `monday`: the week belongs to the year of its Thursday. */
function isoWeekOf(monday) {
	const thursday = new Date(monday.getTime() + 3 * DAY_MS);
	const year = thursday.getUTCFullYear();
	const firstThursday = new Date(Date.UTC(year, 0, 4));
	const week = 1 + Math.round((mondayOf(thursday).getTime() - mondayOf(firstThursday).getTime()) / (7 * DAY_MS));
	return { year, week };
}

/** The Monday that starts ISO week `week` of `year`. */
function mondayOfIsoWeek(year, week) {
	return new Date(mondayOf(new Date(Date.UTC(year, 0, 4))).getTime() + (week - 1) * 7 * DAY_MS);
}

function resolveWeek(spec) {
	if (!spec) {
		const start = new Date(mondayOf(new Date()).getTime() - 7 * DAY_MS);
		return { start, ...isoWeekOf(start) };
	}
	const m = /^(\d{4})-?W(\d{1,2})$/i.exec(spec.trim());
	if (!m) throw new Error(`--week must look like 2026-W41, got "${spec}"`);
	const year = Number(m[1]);
	const week = Number(m[2]);
	const start = mondayOfIsoWeek(year, week);
	if (isoWeekOf(start).year !== year || week < 1) throw new Error(`${spec} is not an ISO week`);
	if (start.getTime() + 7 * DAY_MS > Date.now()) throw new Error(`${spec} has not ended yet`);
	return { start, year, week };
}

// ---- API ----

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(path, { allow404 = false } = {}) {
	const url = `${API}${path}`;
	let res;
	try {
		res = await fetch(url, {
			headers: { accept: 'application/json', 'user-agent': 'decmp-learn-patch-notes' },
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});
	} catch (err) {
		throw new Error(`GET ${url}: ${err.message}`);
	}
	if (allow404 && res.status === 404) return null;
	if (!res.ok) {
		const body = (await res.text()).slice(0, 200);
		throw new Error(`GET ${url}: HTTP ${res.status} ${body}`);
	}
	return res.json();
}

/** index.json, reused from disk while it is fresh so repeated runs cost one request at most. */
async function loadIndex() {
	const key = createHash('sha256').update(API).digest('hex').slice(0, 12);
	const file = join(CACHE_DIR, `index-${key}.json`);
	if (!args['no-cache']) {
		try {
			const age = Date.now() - (await stat(file)).mtimeMs;
			if (age < INDEX_MAX_AGE_MS) {
				console.log(`index.json: cached copy, ${Math.round(age / 60000)} min old`);
				return JSON.parse(await readFile(file, 'utf8'));
			}
		} catch {
			// no usable cache
		}
	}
	const index = await getJson('/data/index.json');
	if (!Array.isArray(index?.projects)) throw new Error('index.json has no projects array');
	await mkdir(CACHE_DIR, { recursive: true });
	await writeFile(file, JSON.stringify(index));
	console.log(`index.json: ${index.projects.length} projects from ${API}`);
	return index;
}

// ---- the digest ----

const pct = (n) => `${n.toFixed(2)}%`;
const pts = (n) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(2)}`;
const time = (s) => new Date(s).getTime();
const escape = (s) => s.replace(/([\\[\]|*_<>`])/g, '\\$1');
const platformName = (id) => (id && PLATFORMS[id]) || (id ? id.toUpperCase() : 'Unknown');

function link(p) {
	return `[${escape(p.name)}](${SITE}/${encodeURIComponent(p.owner)}/${encodeURIComponent(p.repo)})`;
}

function bar(percent) {
	const width = Math.max(0, Math.min(100, percent)).toFixed(1);
	return `<span class="decmp-bar${percent >= 100 ? ' done' : ''}"><span style="width:${width}%"></span></span>`;
}

/** A Markdown table; `align` holds one letter per column, l or r. */
function table(header, align, rows) {
	return [
		`| ${header.join(' | ')} |`,
		`| ${[...align].map((a) => (a === 'r' ? '---:' : '---')).join(' | ')} |`,
		...rows.map((r) => `| ${r.join(' | ')} |`),
	].join('\n');
}

/** What one project did during the week, from its daily history (one point per UTC day with a report). */
function weekOf(project, history, start, end) {
	const before = history.filter((h) => time(h.timestamp) < start).at(-1);
	const during = history.filter((h) => time(h.timestamp) >= start && time(h.timestamp) < end);
	if (during.length === 0) return null;
	const from = before ? before.measures.matched_code_percent : null;
	const to = during.at(-1).measures.matched_code_percent;
	const commits = new Set(during.map((h) => h.commit_sha));
	if (before) commits.delete(before.commit_sha);
	return { project, from, to, gain: to - (from ?? 0), commits: commits.size };
}

function render({ year, week, start, end, projects, moves, newcomers }) {
	const byGain = (a, b) => b.gain - a.gain || a.project.name.localeCompare(b.project.name);
	const established = moves.filter((m) => m.from !== null && !newcomers.has(m.project));

	const highScores = established.filter((m) => m.gain > 0.0005).sort(byGain).slice(0, TOP);
	const cleared = established
		.filter((m) => m.to >= 100 && m.from < 100)
		.sort((a, b) => a.project.name.localeCompare(b.project.name));
	const checkpoints = established
		.map((m) => ({ ...m, mark: CHECKPOINTS.filter((c) => m.from < c && m.to >= c).at(-1) }))
		.filter((m) => m.mark !== undefined && m.to < 100)
		.sort((a, b) => b.mark - a.mark || byGain(a, b));
	// a newcomer's figure is its last one inside the week, not today's
	const endOf = new Map(moves.map((m) => [m.project, m.to]));
	const challengers = [...newcomers]
		.map((p) => ({ project: p, to: endOf.get(p) ?? p.measures.matched_code_percent }))
		.sort((a, b) => b.to - a.to || a.project.name.localeCompare(b.project.name));
	const combos = moves
		.filter((m) => m.commits > 0)
		.sort((a, b) => b.commits - a.commits || byGain(a, b))
		.slice(0, TOP);

	// platform totals: every listed project's latest figures, plus this week's change from the established movers
	const gainBytes = new Map(established.map((m) => [m.project, (m.gain / 100) * m.project.measures.total_code]));
	const platforms = new Map();
	for (const p of projects) {
		const id = p.platform || 'unknown';
		const row = platforms.get(id) ?? { id, count: 0, total: 0, matched: 0, gained: 0 };
		row.count += 1;
		row.total += p.measures.total_code;
		row.matched += p.measures.matched_code;
		row.gained += gainBytes.get(p) ?? 0;
		platforms.set(id, row);
	}
	const platformRows = [...platforms.values()]
		.filter((r) => r.total > 0)
		.sort((a, b) => b.total - a.total || a.id.localeCompare(b.id));

	const range = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', timeZone: 'UTC' });
	const published = new Date(end).toISOString().slice(0, 10);
	const moved = moves.filter((m) => m.gain > 0.0005).length;
	const description =
		`${moved} project${moved === 1 ? '' : 's'} gained matched code, ${cleared.length} cleared, ` +
		`${challengers.length} new challenger${challengers.length === 1 ? '' : 's'}.`;

	const out = [];
	out.push('---');
	out.push(`title: "Patch Notes · Week ${week}, ${year}"`);
	out.push(`date: ${published}`);
	out.push(`description: "${description}"`);
	out.push('sidebar:');
	out.push(`  label: "Week ${week}, ${year}"`);
	out.push(`  order: ${-(year * 100 + week)}`);
	out.push('editUrl: false');
	out.push('lastUpdated: false');
	out.push('---');
	out.push('');
	out.push(
		`Progress on [decmp.dev](${SITE}) from Monday ${range.format(start)} to Sunday ${range.format(end - DAY_MS)} ${year} (UTC). ` +
			'Figures are matched code for each project’s default version, across all of its code.',
	);
	out.push('');

	out.push('## High Scores');
	out.push('');
	out.push('The biggest gains in matched code this week, in percentage points.');
	out.push('');
	out.push(
		highScores.length
			? table(
					['Game', 'Platform', 'Week', 'Now', ''],
					'llrrl',
					highScores.map((m) => [link(m.project), platformName(m.project.platform), pts(m.gain), pct(m.to), bar(m.to)]),
				)
			: 'No project gained matched code this week.',
	);
	out.push('');

	out.push('## Stage Cleared');
	out.push('');
	out.push(
		cleared.length
			? cleared.map((m) => `- ${link(m.project)} (${platformName(m.project.platform)}) reached 100% matched code.`).join('\n')
			: 'Nobody reached 100% this week.',
	);
	out.push('');

	out.push('## New Challengers');
	out.push('');
	out.push(
		challengers.length
			? challengers
					.map(
						({ project: p, to }) =>
							`- ${link(p)} (${platformName(p.platform)}) joined at ${pct(to)}${to >= 100 ? ', already cleared' : ''}.`,
					)
					.join('\n')
			: 'No new projects reported for the first time this week.',
	);
	out.push('');

	out.push('## Checkpoints');
	out.push('');
	out.push(
		checkpoints.length
			? checkpoints
					.map((m) => `- ${link(m.project)} passed ${m.mark}% (${pct(m.from)} → ${pct(m.to)}).`)
					.join('\n')
			: 'No project crossed 25, 50, 75 or 90% this week.',
	);
	out.push('');

	out.push('## Combo Meter');
	out.push('');
	out.push('Days with a new measured commit. decmp.dev keeps one point per day, so seven is the maximum.');
	out.push('');
	out.push(
		combos.length
			? table(
					['Game', 'Platform', 'Days', 'Week'],
					'llrr',
					combos.map((m) => [link(m.project), platformName(m.project.platform), String(m.commits), m.from === null ? 'new' : pts(m.gain)]),
				)
			: 'No measured commits this week.',
	);
	out.push('');

	out.push('## By platform');
	out.push('');
	out.push('Matched code across every listed project on each console, with this week’s change.');
	out.push('');
	out.push(
		platformRows.length
			? table(
					['Platform', 'Projects', 'Matched', '', 'Week'],
					'lrrlr',
					platformRows.map((r) => {
						const share = (100 * r.matched) / r.total;
						return [platformName(r.id === 'unknown' ? null : r.id), String(r.count), pct(share), bar(share), pts((100 * r.gained) / r.total)];
					}),
				)
			: 'No platform data this week.',
	);
	out.push('');

	return out.join('\n');
}

async function main() {
	const { start: startDate, year, week } = resolveWeek(args.week);
	const start = startDate.getTime();
	const end = start + 7 * DAY_MS;
	const name = `${year}-W${String(week).padStart(2, '0')}`;
	console.log(`week ${name}: ${startDate.toISOString().slice(0, 10)} to ${new Date(end - DAY_MS).toISOString().slice(0, 10)}`);

	const index = await loadIndex();
	const projects = index.projects.filter((p) => p.measures && p.commit);

	const newcomers = new Set(projects.filter((p) => p.started && time(p.started) >= start && time(p.started) < end));
	// a project whose latest report is older than the day before the week began cannot have moved during it
	const active = projects.filter((p) => time(p.commit.timestamp) >= start - DAY_MS);
	console.log(`${active.length} of ${projects.length} projects reported since ${new Date(start - DAY_MS).toISOString().slice(0, 10)}`);

	const moves = [];
	for (const [i, p] of active.entries()) {
		const path = `/data/${encodeURIComponent(p.owner)}/${encodeURIComponent(p.repo)}/history.json`;
		const history = await getJson(path, { allow404: true });
		if (history !== null && !Array.isArray(history)) throw new Error(`${path}: expected an array`);
		const move = history && weekOf(p, history, start, end);
		if (move) moves.push(move);
		if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${active.length} histories`);
		await sleep(PAUSE_MS);
	}
	console.log(`${active.length + 1} requests at most; ${moves.length} projects reported during the week`);

	const markdown = render({ year, week, start, end, projects, moves, newcomers });
	await mkdir(OUT_DIR, { recursive: true });
	const file = join(OUT_DIR, `${name}.md`);
	await writeFile(`${file}.tmp`, markdown);
	await rename(`${file}.tmp`, file);
	console.log(`wrote ${file}`);
	if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `issue=${name}\n`);
}

main().catch((err) => {
	console.error(`patch-notes: ${err.message}`);
	process.exit(1);
});
