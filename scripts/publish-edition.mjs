/**
 * Publish Edition — Archive + Newsletter in one step.
 *
 * Generates the archive digest definition, registers it in archive-issues.ts,
 * and sends the newsletter via Listmonk. Does NOT post to social media
 * (that's a separate step for future multi-platform support).
 *
 * Usage:
 *   npm run publish-edition -- \
 *     --id ai-005 \
 *     --alias ai-engineering-005 \
 *     --series "AI Engineering" \
 *     --date "July 16, 2026" \
 *     --title "AI Engineering 005" \
 *     --summary "8 X articles on skill engineering, outreach, SEO tools, finance AI, and content creation." \
 *     --intro "Today you will find several case studies in AI skills..." \
 *     --edition-file lists/editions/2026-07-16-ai-engineering-005-feedfree-linked.md \
 *     --lane ai-engineering \
 *     --name "AI Engineering 005" \
 *     --subject "Feedfree AI: AI Engineering 005 — Real World AI Skills" \
 *     --confirm-live-send
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const ARCHIVE_DIGESTS = resolve(ROOT, 'app/archive-digests.ts');
const ARCHIVE_ISSUES = resolve(ROOT, 'app/archive-issues.ts');

// ── parseArgs ──────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = {
    id: '',
    alias: '',
    series: '',
    date: '',
    title: '',
    summary: '',
    intro: '',
    editionFile: '',
    lane: '',
    name: '',
    subject: '',
    confirmLiveSend: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1]?.trim();

    if (arg === '--help' || arg === '-h') { opts.help = true; continue; }
    if (arg === '--confirm-live-send') { opts.confirmLiveSend = true; continue; }
    if (!next) throw new Error(`${arg} requires a value.`);

    const map = {
      '--id': 'id', '--alias': 'alias', '--series': 'series',
      '--date': 'date', '--title': 'title', '--summary': 'summary',
      '--intro': 'intro', '--edition-file': 'editionFile',
      '--lane': 'lane', '--name': 'name', '--subject': 'subject',
    };

    if (map[arg]) { opts[map[arg]] = next; i++; continue; }
    throw new Error(`Unknown arg: ${arg}`);
  }
  return opts;
}

function printHelp() {
  console.log([
    'Usage: npm run publish-edition -- \\',
    '  --id ai-005 \\',
    '  --alias ai-engineering-005 \\',
    '  --series "AI Engineering" \\',
    '  --date "July 16, 2026" \\',
    '  --title "AI Engineering 005" \\',
    '  --summary "Brief description..." \\',
    '  --intro "Opening paragraph..." \\',
    '  --edition-file lists/editions/2026-07-16-ai-engineering-005-feedfree-linked.md \\',
    '  --lane ai-engineering \\',
    '  --name "AI Engineering 005" \\',
    '  --subject "Feedfree AI: AI Engineering 005 — Real World AI Skills" \\',
    '  --confirm-live-send',
    '',
    'What it does:',
    '  1. Generates the digest definition and appends it to app/archive-digests.ts',
    '  2. Registers the new digest in app/archive-issues.ts',
    '  3. Sends the newsletter to the specified Listmonk lane',
    '',
    'Note: the --edition-file must be the *linked* (email-ready) markdown file.',
    'This script does NOT post to X or other social platforms (separate step).',
  ].join('\n'));
}

// ── digest generation ──────────────────────────────────────────────────────

function buildDigestDef(opts) {
  const escapedIntro = opts.intro.replace(/"/g, '\\"').replace(/\n/g, '\\n');
  const escapedSummary = opts.summary.replace(/"/g, '\\"').replace(/\n/g, '\\n');

  return `
export const aiEngineering005Digest: ArchiveIssue = {
  id: "${opts.id}",
  aliases: ["${opts.alias}"],
  series: "${opts.series}",
  date: "${opts.date}",
  title: "${opts.title}",
  summary:
    "${escapedSummary}",
  intro:
    "${escapedIntro}",

  itemsTitle: "Links-first version",
  disclosure:
    "[disclosure: this was written with AI with human edits and article selection. If you would like to see more articles like this, please subscribe to our newsletter]",
};
`;
}

// ── archive-digests.ts insertion ────────────────────────────────────────────

async function appendToArchiveDigests(opts) {
  let content = await readFile(ARCHIVE_DIGESTS, 'utf-8');

  // Check for duplicate
  if (content.includes(`id: "${opts.id}"`)) {
    console.log(`⚠  Digest with id "${opts.id}" already exists in archive-digests.ts — skipping insert.`);
    return false;
  }

  const digestDef = buildDigestDef(opts);

  // Insert before the last export block (find a stable anchor)
  // We'll insert before the first existing digest definition to keep newest first
  const anchor = 'export const aiEngineering001Issue';
  const idx = content.indexOf(anchor);
  if (idx === -1) throw new Error(`Could not find anchor "${anchor}" in archive-digests.ts`);

  content = content.slice(0, idx) + digestDef + '\n' + content.slice(idx);
  await writeFile(ARCHIVE_DIGESTS, content, 'utf-8');
  console.log(`✓ Appended digest "${opts.id}" to archive-digests.ts`);
  return true;
}

// ── archive-issues.ts registration ──────────────────────────────────────────

async function registerInArchiveIssues(opts, digestVarName) {
  let content = await readFile(ARCHIVE_ISSUES, 'utf-8');

  // Add import
  const importAnchor = 'import {\n';
  if (!content.includes(digestVarName)) {
    // Insert as first import (after the opening brace)
    const importEnd = content.indexOf('  aiEngineering001Issue,');
    if (importEnd === -1) throw new Error('Could not find import anchor');
    content = content.slice(0, importEnd) + `  ${digestVarName},\n` + content.slice(importEnd);
  }

  // Add to array (newest first, after the opening bracket)
  const arrayAnchor = 'export const archiveIssues: ArchiveIssue[] = [\n';
  if (!content.includes(`${digestVarName},`)) {
    content = content.replace(arrayAnchor, arrayAnchor + `  ${digestVarName},\n`);
  }

  await writeFile(ARCHIVE_ISSUES, content, 'utf-8');
  console.log(`✓ Registered "${digestVarName}" in archive-issues.ts`);
}

// ── listmonk send (reuses live-send internals) ──────────────────────────────

async function sendViaListmonk(opts) {
  // Dynamically import the live-send module
  const { default: liveSend } = await import('./listmonk-live-send.mjs');
  // The live-send module runs its main() automatically on import...
  // Instead, we'll shell out to it
  const { spawnSync } = await import('node:child_process');
  const args = [
    'scripts/listmonk-live-send.mjs',
    '--lane', opts.lane,
    '--name', opts.name,
    '--subject', opts.subject,
    '--body-file', opts.editionFile,
  ];
  if (opts.confirmLiveSend) args.push('--confirm-live-send');

  const result = spawnSync('node', args, { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`Listmonk send failed with exit code ${result.status}`);
  }
}

// ── validation ──────────────────────────────────────────────────────────────

function validate(opts) {
  const required = ['id', 'alias', 'series', 'date', 'title', 'summary', 'intro', 'editionFile', 'lane', 'name', 'subject'];
  const missing = required.filter(k => !opts[k]);
  if (missing.length) throw new Error(`Missing required args: ${missing.join(', ')}`);

  const editionPath = resolve(ROOT, opts.editionFile);
  if (!existsSync(editionPath)) throw new Error(`Edition file not found: ${editionPath}`);
  opts.editionFile = editionPath;
}

// ── main ────────────────────────────────────────────────────────────────────

const opts = parseArgs(process.argv.slice(2));

if (opts.help) { printHelp(); process.exit(0); }

try {
  validate(opts);
} catch (err) {
  console.error(`✗ ${err.message}`);
  console.error('Run with --help for usage.');
  process.exit(1);
}

// Derive variable name from id (e.g., "ai-005" → "aiEngineering005Digest")
const digestVarName = opts.id
  .split('-')
  .map((part, i) => i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
  .join('') + 'Digest';

console.log(`Publishing: ${opts.title}`);
console.log(`  Archive digest: ${digestVarName} (id: ${opts.id})`);
console.log(`  Lane: ${opts.lane}`);
console.log(`  Edition file: ${opts.editionFile}`);
console.log('');

// Step 1: Archive
const inserted = await appendToArchiveDigests(opts);
if (inserted) {
  await registerInArchiveIssues(opts, digestVarName);
} else {
  console.log('  (archive already contains this digest — skipping)');
}

// Step 2: Newsletter
if (!opts.confirmLiveSend) {
  console.log('\n⚠  Skipping listmonk send (--confirm-live-send not set).');
  console.log('   Add --confirm-live-send to also send the newsletter.');
} else {
  console.log('\nSending newsletter...');
  await sendViaListmonk(opts);
}

console.log('\n✓ Done. Remember to commit and push the archive changes to GitHub.');
