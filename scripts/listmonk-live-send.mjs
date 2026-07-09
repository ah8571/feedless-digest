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
const MANAGE_PREFERENCES_URL = 'https://feedfree.tech/subscribed?token={{ .Subscriber.Attribs.unsubscribe_token }}';

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
    listName: '',
    listId: '',
    tags: splitCsv(process.env.LISTMONK_TAGS),
    fromName: process.env.LISTMONK_FROM_NAME?.trim() || 'Feedfree Digest',
    fromEmail: process.env.LISTMONK_FROM_EMAIL?.trim() || '',
    messenger: 'email',
    templateId: process.env.LISTMONK_TEMPLATE_ID?.trim() || '',
    noTemplate: false,
    confirmLiveSend: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1]?.trim();

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--no-template') {
      options.noTemplate = true;
      continue;
    }

    if (arg === '--confirm-live-send') {
      options.confirmLiveSend = true;
      continue;
    }

    if (!next && !['--help', '-h', '--no-template', '--confirm-live-send'].includes(arg)) {
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
    'Usage: npm run listmonk:live-send -- --lane ai-engineering --name "AI Engineering 001" --subject "Feedfree AI: AI Engineering 001" --body-file lists/editions/2026-07-06-ai-engineering-001-feedfree-linked.md --confirm-live-send',
    '',
    'Required environment variables:',
    '  LISTMONK_URL            Example: https://mail.feedfree.tech',
    '  LISTMONK_USERNAME       API or admin username',
    '  LISTMONK_PASSWORD       API token or password',
    '',
    'CLI flags:',
    `  --lane <slug>              Supported lanes: ${listSupportedLaneSlugs().join(', ')}`,
    '  --name <value>             Campaign name',
    '  --subject <value>          Email subject',
    '  --body <value>             Inline campaign body',
    '  --body-file <path>         Read campaign body from file',
    '  --altbody <value>          Optional alternate plain text body',
    '  --list <value>             Override target list name',
    '  --list-id <value>          Override target list id',
    '  --tag <value>              Campaign tag; repeatable',
    '  --no-template              Do not attach a Listmonk template to this campaign',
    '  --confirm-live-send        Required safety flag before sending to real subscribers',
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
      throw new Error('--list-id must be a positive integer.');
    }
    return parsed;
  }

  const listName = options.listName;
  if (!listName) {
    throw new Error('A target list is required. Provide --lane or --list.');
  }

  const params = new URLSearchParams({ per_page: 'all', minimal: 'false', status: 'active' });
  const response = await requestJson(`${baseUrl}/api/lists?${params.toString()}`, {
    headers: {
      Authorization: authHeader,
    },
  });

  const list = response.data.results.find((entry) => entry.name === listName);
  if (!list) {
    throw new Error(`Could not find active list named "${listName}".`);
  }

  return list.id;
}

async function getListDetails(baseUrl, authHeader, listId) {
  const response = await requestJson(`${baseUrl}/api/lists/${listId}`, {
    headers: {
      Authorization: authHeader,
    },
  });

  return response.data;
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

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInlineLinks(value) {
  const pattern = /(\[[^\]]+\]\((https?:\/\/[^\s)]+)\)|"([^"]+)"\s*\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+))/g;
  const parts = [];
  let lastIndex = 0;

  for (const match of value.matchAll(pattern)) {
    const matchedText = match[0];
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      parts.push(escapeHtml(value.slice(lastIndex, matchIndex)));
    }

    const markdownMatch = match[1];
    const markdownUrl = match[2];
    const quotedLabel = match[3];
    const quotedUrl = match[4];
    const bareUrl = match[5];

    if (markdownMatch && markdownUrl) {
      const label = markdownMatch.slice(1, markdownMatch.indexOf(']'));
      parts.push(
        `<a href="${escapeHtml(markdownUrl)}" style="color:#1d1b18; text-decoration:underline;">${escapeHtml(label)}</a>`
      );
    } else if (quotedLabel && quotedUrl) {
      parts.push(
        `<a href="${escapeHtml(quotedUrl)}" style="color:#1d1b18; text-decoration:underline;">&quot;${escapeHtml(quotedLabel)}&quot;</a>`
      );
    } else if (bareUrl) {
      parts.push(
        `<a href="${escapeHtml(bareUrl)}" style="color:#1d1b18; text-decoration:underline;">${escapeHtml(bareUrl)}</a>`
      );
    }

    lastIndex = matchIndex + matchedText.length;
  }

  if (lastIndex < value.length) {
    parts.push(escapeHtml(value.slice(lastIndex)));
  }

  return parts.join('');
}

function renderInlineLinksForHeading(value) {
  return renderInlineLinks(value).replaceAll('&quot;', '"');
}

function renderBodyHtml(rawBody) {
  const normalizedBody = rawBody
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n');
  const lines = normalizedBody.split('\n');
  const blocks = [];

  for (let index = 0; index < lines.length; ) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      blocks.push(`<h1 style="font-size:28px; line-height:1.08; margin:0 0 16px; color:#1d1b18; font-weight:700;">${renderInlineLinksForHeading(line.slice(2).trim())}</h1>`);
      index += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push(`<h2 style="font-size:20px; line-height:1.2; margin:24px 0 12px; color:#1d1b18; font-weight:700;">${renderInlineLinksForHeading(line.slice(3).trim())}</h2>`);
      index += 1;
      continue;
    }

    if (line.startsWith('- ')) {
      const items = [];
      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(`<li style="margin:0 0 10px;">${escapeHtml(lines[index].trim().slice(2).trim())}</li>`);
        index += 1;
      }
      blocks.push(`<ul style="margin:0 0 20px; padding-left:20px; color:#5f5647; font-size:16px; line-height:1.7;">${items.join('')}</ul>`);
      continue;
    }

    const paragraphLines = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (!current || current.startsWith('# ') || current.startsWith('## ') || current.startsWith('- ')) {
        break;
      }
      paragraphLines.push(current);
      index += 1;
    }

    const renderedParagraph = renderInlineLinks(paragraphLines.join(' '));
    blocks.push(`<p style="font-size:16px; line-height:1.7; margin:0 0 16px; color:#5f5647;">${renderedParagraph}</p>`);
  }

  return blocks.join('');
}

function renderBrandedEmailHtml(options, rawBody) {
  const bodyHtml = renderBodyHtml(rawBody);
  return `
    <div style="margin:0; padding:0; background-color:#ffffff; color:#1d1b18; font-family:Arial, sans-serif;">
      <div style="width:100%; margin:0 auto; padding:0; box-sizing:border-box;">
        <p style="font-size:16px; line-height:1.7; margin:0 0 18px; color:#5f5647; text-align:center;">
          <a href="{{ MessageURL }}" style="color:#1d1b18; text-decoration:underline;">View in browser</a>
          &nbsp;|&nbsp;
          <a href="${MANAGE_PREFERENCES_URL}" style="color:#1d1b18; text-decoration:underline;">Unsubscribe</a>
        </p>
        <div style="text-align:center; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:700; color:#1d1b18; margin-bottom:18px;">${escapeHtml(options.fromName || 'Feedfree Digest')}</div>
        <div style="width:100%; height:1px; margin:0 0 26px; background:#ebe7e0;"></div>
        ${bodyHtml}
      </div>
    </div>
  `.trim();
}

function buildContent(options, rawBody) {
  return {
    contentType: 'html',
    body: renderBrandedEmailHtml(options, rawBody),
    altBody: options.altBody || rawBody,
  };
}

function buildCampaignPayload(options, listId, body) {
  const content = buildContent(options, body);
  return {
    name: options.name,
    subject: options.subject,
    lists: [listId],
    type: 'regular',
    content_type: content.contentType,
    body: content.body,
    altbody: content.altBody,
    from_email: formatFromEmail(options.fromName, options.fromEmail),
    messenger: options.messenger,
    template_id: options.noTemplate ? undefined : normalizeTemplateId(options.templateId),
    tags: Array.from(new Set(options.tags)),
  };
}

function applyLaneDefaults(options) {
  if (!options.lane) return options;

  const lane = getLaneOrThrow(options.lane);
  return {
    ...options,
    listName: options.listName || getLaneListName(lane),
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

  if (!options.confirmLiveSend) {
    throw new Error('Refusing live send without --confirm-live-send.');
  }

  const baseUrl = getRequiredEnv('LISTMONK_URL').replace(/\/$/, '');
  const username = getRequiredEnv('LISTMONK_USERNAME');
  const password = getRequiredEnv('LISTMONK_PASSWORD');

  if (!options.name) throw new Error('Missing --name.');
  if (!options.subject) throw new Error('Missing --subject.');
  if (!options.lane && !options.listName && !options.listId) {
    throw new Error('Provide --lane, --list, or --list-id.');
  }

  const authHeader = buildAuthHeader(username, password);
  const listId = await resolveListId(baseUrl, authHeader, options);
  const listDetails = await getListDetails(baseUrl, authHeader, listId);
  const confirmedCount = Number(listDetails?.subscriber_statuses?.confirmed ?? 0);

  if (confirmedCount <= 0) {
    throw new Error(`List ${listDetails.name} (#${listId}) has no confirmed subscribers.`);
  }

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

  const started = await requestJson(`${baseUrl}/api/campaigns/${campaignId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'running' }),
  });

  console.log([
    `Created campaign ${campaignId}.`,
    `Started campaign with status ${started.data.status}.`,
    `Target list: ${listDetails.name} (#${listId})`,
    `Confirmed subscribers on list: ${confirmedCount}`,
  ].join('\n'));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});