import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  getLaneListName,
  getLaneOrThrow,
  getLaneSenderName,
  getLaneTags,
  listSupportedLaneSlugs,
} from './listmonk-lanes.mjs';

const ENV_FILES = ['.env.local', '.env'];

loadEnvFiles();

function loadEnvFiles() {
  for (const file of ENV_FILES) {
    const absolutePath = resolve(process.cwd(), file);
    if (!existsSync(absolutePath)) continue;

    const contents = requireText(absolutePath);
    contents.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) return;

      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key || process.env[key]) return;

      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      process.env[key] = stripQuotes(rawValue);
    });
  }
}

function requireText(filePath) {
  return readFileSync(filePath, 'utf8');
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseArgs(argv) {
  const options = {
    name: '',
    subject: '',
    body: '',
    bodyFile: '',
    altBody: '',
    lane: '',
    listName: process.env.LISTMONK_TEST_LIST_NAME?.trim() || 'Default list',
    listId: process.env.LISTMONK_TEST_LIST_ID?.trim() || '',
    emails: splitCsv(process.env.LISTMONK_TEST_EMAILS),
    tags: splitCsv(process.env.LISTMONK_TAGS),
    contentType: process.env.LISTMONK_CONTENT_TYPE?.trim() || 'markdown',
    fromName: process.env.LISTMONK_FROM_NAME?.trim() || 'Feedfree Digest',
    fromEmail: process.env.LISTMONK_FROM_EMAIL?.trim() || '',
    messenger: 'email',
    templateId: process.env.LISTMONK_TEMPLATE_ID?.trim() || '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1]?.trim();

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (!next && !['--help', '-h'].includes(arg)) {
      throw new Error(`${arg} requires a value.`);
    }

    if (arg === '--name') {
      options.name = next;
      index += 1;
      continue;
    }

    if (arg === '--subject') {
      options.subject = next;
      index += 1;
      continue;
    }

    if (arg === '--body') {
      options.body = next;
      index += 1;
      continue;
    }

    if (arg === '--body-file') {
      options.bodyFile = next;
      index += 1;
      continue;
    }

    if (arg === '--altbody') {
      options.altBody = next;
      index += 1;
      continue;
    }

    if (arg === '--lane') {
      options.lane = next;
      index += 1;
      continue;
    }

    if (arg === '--list') {
      options.listName = next;
      index += 1;
      continue;
    }

    if (arg === '--list-id') {
      options.listId = next;
      index += 1;
      continue;
    }

    if (arg === '--to') {
      options.emails = splitCsv(next);
      index += 1;
      continue;
    }

    if (arg === '--tag') {
      options.tags.push(next);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log([
    'Usage: npm run listmonk:test-send -- --name "AI Engineering Test" --subject "Feedfree Digest: AI Engineering Test" --body-file drafts/ai-test.md --to you@example.com',
    '',
    'Required environment variables:',
    '  LISTMONK_URL            Example: https://mail.feedfree.tech',
    '  LISTMONK_USERNAME       API or admin username',
    '  LISTMONK_PASSWORD       API token or password',
    '',
    'Optional environment variables:',
    '  LISTMONK_TEST_LIST_NAME Default: Default list',
    '  LISTMONK_TEST_LIST_ID   Skips list lookup if provided',
    '  LISTMONK_TEST_EMAILS    Comma-separated test recipients',
    '  LISTMONK_FROM_NAME      Default sender name. Defaults to Feedfree Digest.',
    '  LISTMONK_FROM_EMAIL     Override campaign from address',
    '  LISTMONK_TEMPLATE_ID    Numeric template id',
    '  LISTMONK_TAGS           Comma-separated default tags',
    '  LISTMONK_CONTENT_TYPE   markdown, html, plain, richtext, visual',
    '',
    'CLI flags:',
    `  --lane <slug>          Supported lanes: ${listSupportedLaneSlugs().join(', ')}`,
    '  --name <value>          Campaign name',
    '  --subject <value>       Email subject',
    '  --body <value>          Inline campaign body',
    '  --body-file <path>      Read campaign body from file',
    '  --altbody <value>       Optional alternate plain text body',
    '  --list <value>          Target list name for the draft campaign',
    '  --list-id <value>       Target list id for the draft campaign',
    '  --to <emails>           Comma-separated test recipients',
    '  --tag <value>           Campaign tag; repeatable',
  ].join('\n'));
}

function splitCsv(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env.local or your shell environment.`);
  }
  return value;
}

function buildAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`Listmonk API request failed: ${response.status} ${response.statusText}\n${text}`);
  }

  return body;
}

async function resolveListId(baseUrl, authHeader, options) {
  if (options.listId) {
    const parsed = Number(options.listId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error('LISTMONK_TEST_LIST_ID or --list-id must be a positive integer.');
    }
    return parsed;
  }

  const params = new URLSearchParams({ per_page: 'all', minimal: 'true', status: 'active' });
  const response = await requestJson(`${baseUrl}/api/lists?${params.toString()}`, {
    headers: {
      Authorization: authHeader,
    },
  });

  const list = response.data.results.find((entry) => entry.name === options.listName);
  if (!list) {
    throw new Error(`Could not find active list named "${options.listName}".`);
  }

  return list.id;
}

async function getSubscribers(baseUrl, authHeader, options) {
  const params = new URLSearchParams({ per_page: 'all' });
  const response = await requestJson(`${baseUrl}/api/subscribers?${params.toString()}`, {
    headers: {
      Authorization: authHeader,
    },
  });

  const byEmail = new Map();
  for (const subscriber of response.data.results) {
    if (!subscriber?.email) continue;
    byEmail.set(String(subscriber.email).toLowerCase(), subscriber);
  }

  return options.emails.map((email) => byEmail.get(email.toLowerCase())).filter(Boolean);
}

async function ensureTestSubscribers(baseUrl, authHeader, options, listId) {
  const knownSubscribers = await getSubscribers(baseUrl, authHeader, options);
  const knownEmails = new Set(knownSubscribers.map((subscriber) => subscriber.email.toLowerCase()));

  for (const email of options.emails) {
    if (knownEmails.has(email.toLowerCase())) continue;

    await requestJson(`${baseUrl}/api/subscribers`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name: email,
        status: 'enabled',
        lists: [listId],
        preconfirm_subscriptions: true,
      }),
    });
  }
}

async function getBody(options) {
  if (options.body) return options.body;
  if (!options.bodyFile) {
    throw new Error('Provide --body or --body-file.');
  }

  return readFile(resolve(process.cwd(), options.bodyFile), 'utf8');
}

function normalizeTemplateId(rawValue) {
  if (!rawValue) return undefined;
  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('LISTMONK_TEMPLATE_ID must be a positive integer.');
  }
  return parsed;
}

function formatFromEmail(fromName, fromEmail) {
  if (!fromEmail) return undefined;
  if (fromEmail.includes('<')) return fromEmail;
  if (!fromName) return fromEmail;
  return `${fromName} <${fromEmail}>`;
}

function buildCampaignPayload(options, listId, body) {
  return {
    name: options.name,
    subject: options.subject,
    lists: [listId],
    type: 'regular',
    content_type: options.contentType,
    body,
    altbody: options.altBody || undefined,
    from_email: formatFromEmail(options.fromName, options.fromEmail),
    messenger: options.messenger,
    template_id: normalizeTemplateId(options.templateId),
    tags: Array.from(new Set(options.tags)),
  };
}

function applyLaneDefaults(options) {
  if (!options.lane) return options;

  const lane = getLaneOrThrow(options.lane);
  return {
    ...options,
    listName: options.listName === (process.env.LISTMONK_TEST_LIST_NAME?.trim() || 'Default list')
      ? getLaneListName(lane)
      : options.listName,
    fromName: options.fromName === (process.env.LISTMONK_FROM_NAME?.trim() || 'Feedfree Digest')
      ? getLaneSenderName(lane)
      : options.fromName,
    tags: Array.from(new Set([...getLaneTags(lane), ...options.tags])),
  };
}

async function main() {
  const options = applyLaneDefaults(parseArgs(process.argv.slice(2)));
  if (options.help) {
    printHelp();
    return;
  }

  const baseUrl = getRequiredEnv('LISTMONK_URL').replace(/\/$/, '');
  const username = getRequiredEnv('LISTMONK_USERNAME');
  const password = getRequiredEnv('LISTMONK_PASSWORD');

  if (!options.name) throw new Error('Missing --name.');
  if (!options.subject) throw new Error('Missing --subject.');
  if (!options.emails.length) {
    throw new Error('Provide test recipients with LISTMONK_TEST_EMAILS or --to.');
  }

  const authHeader = buildAuthHeader(username, password);
  const listId = await resolveListId(baseUrl, authHeader, options);
  await ensureTestSubscribers(baseUrl, authHeader, options, listId);
  const body = await getBody(options);
  const payload = buildCampaignPayload(options, listId, body);

  const created = await requestJson(`${baseUrl}/api/campaigns`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const campaignId = created.data.id;

  await requestJson(`${baseUrl}/api/campaigns/${campaignId}/test`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      subscribers: options.emails,
    }),
  });

  console.log([
    `Created draft campaign ${campaignId}.`,
    `Target list: ${options.listName} (#${listId})`,
    `Sent test message to: ${options.emails.join(', ')}`,
  ].join('\n'));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});