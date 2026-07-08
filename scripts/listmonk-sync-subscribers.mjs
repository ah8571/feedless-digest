import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  getLane,
  getLaneListName,
  listSupportedLaneSlugs,
} from './listmonk-lanes.mjs';

const ENV_FILES = ['.env.local', '.env'];

loadEnvFiles();

function loadEnvFiles() {
  for (const file of ENV_FILES) {
    const absolutePath = resolve(process.cwd(), file);
    if (!existsSync(absolutePath)) continue;

    const contents = readFileSync(absolutePath, 'utf8');
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

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
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

function parseArgs(argv) {
  const options = {
    apply: false,
    lanes: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1]?.trim();

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--apply') {
      options.apply = true;
      continue;
    }

    if (arg === '--lane') {
      if (!next) throw new Error('--lane requires a value.');
      options.lanes.push(next);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log([
    'Usage: npm run listmonk:sync-subscribers -- [--apply] [--lane ai-engineering] [--lane social-media-marketing]',
    '',
    'Default mode is dry-run. Use --apply to write to Listmonk.',
    '',
    'Required environment variables:',
    '  SUPABASE_URL',
    '  SUPABASE_SERVICE_ROLE_KEY',
    '  LISTMONK_URL',
    '  LISTMONK_USERNAME',
    '  LISTMONK_PASSWORD',
    '',
    `Supported lanes: ${listSupportedLaneSlugs().join(', ')}`,
  ].join('\n'));
}

function getManagedLanes(selectedLanes) {
  const slugs = selectedLanes.length ? selectedLanes : listSupportedLaneSlugs();
  return slugs.map((slug) => {
    const lane = getLane(slug);
    if (!lane) {
      throw new Error(`Unknown lane \"${slug}\".`);
    }
    return lane;
  });
}

function buildLaneLookup(lanes) {
  const map = new Map();
  for (const lane of lanes) {
    map.set(lane.slug, lane);
  }
  return map;
}

async function fetchConfirmedSignups(supabase) {
  const { data, error } = await supabase
    .from('newsletter_signups')
    .select('email, source, topics, confirmed_at, created_at, updated_at')
    .eq('status', 'confirmed')
    .is('unsubscribed_at', null)
    .order('confirmed_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }

  return data ?? [];
}

async function fetchLists(baseUrl, authHeader) {
  const response = await requestJson(`${baseUrl}/api/lists?per_page=all&minimal=true&status=active`, {
    headers: { Authorization: authHeader },
  });

  return response.data.results ?? [];
}

async function fetchSubscribers(baseUrl, authHeader) {
  const response = await requestJson(`${baseUrl}/api/subscribers?per_page=all`, {
    headers: { Authorization: authHeader },
  });

  return response.data.results ?? [];
}

function getManagedListMap(lanes, lists) {
  const byName = new Map(lists.map((entry) => [entry.name, entry]));
  const managedListMap = new Map();

  for (const lane of lanes) {
    const listName = getLaneListName(lane);
    const list = byName.get(listName);
    if (!list) continue;
    managedListMap.set(lane.slug, list);
  }

  return managedListMap;
}

function buildSyncPlan(signups, existingSubscribers, laneLookup, managedListMap) {
  const existingByEmail = new Map(
    existingSubscribers
      .filter((subscriber) => subscriber?.email)
      .map((subscriber) => [String(subscriber.email).toLowerCase(), subscriber])
  );

  const managedListIds = new Set(Array.from(managedListMap.values()).map((list) => list.id));
  const plan = [];

  for (const signup of signups) {
    const email = signup.email?.trim().toLowerCase();
    if (!email) continue;

    const matchedLaneSlugs = (signup.topics ?? []).filter((topic) => laneLookup.has(topic));
    const targetListIds = matchedLaneSlugs
      .map((slug) => managedListMap.get(slug)?.id)
      .filter(Boolean);

    const existing = existingByEmail.get(email) ?? null;
    const currentListIds = (existing?.lists ?? []).map((entry) => entry.id);
    const preservedListIds = currentListIds.filter((id) => !managedListIds.has(id));
    const finalListIds = Array.from(new Set([...preservedListIds, ...targetListIds]));

    plan.push({
      email,
      source: signup.source ?? 'landing-page',
      topics: signup.topics ?? [],
      existingSubscriberId: existing?.id ?? null,
      matchedLaneSlugs,
      finalListIds,
      currentListIds,
    });
  }

  return plan;
}

async function applySyncPlan(baseUrl, authHeader, plan) {
  for (const entry of plan) {
    const payload = {
      email: entry.email,
      name: entry.email,
      status: 'enabled',
      lists: entry.finalListIds,
      attribs: {
        topics: entry.topics,
        source: entry.source,
        sync_source: 'supabase',
      },
      preconfirm_subscriptions: true,
    };

    if (entry.existingSubscriberId) {
      await requestJson(`${baseUrl}/api/subscribers/${entry.existingSubscriberId}`, {
        method: 'PATCH',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      continue;
    }

    await requestJson(`${baseUrl}/api/subscribers`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }
}

function summarizePlan(plan, managedListMap) {
  const managedLists = Array.from(managedListMap.entries()).map(([slug, list]) => `${slug} -> ${list.name} (#${list.id})`);
  const lines = [
    `Managed lists: ${managedLists.length ? managedLists.join('; ') : 'none found yet'}`,
    `Subscribers considered: ${plan.length}`,
  ];

  for (const entry of plan) {
    lines.push(
      `${entry.email} | lanes=${entry.matchedLaneSlugs.join(',') || 'none'} | lists=${entry.finalListIds.join(',') || 'none'} | ${entry.existingSubscriberId ? 'update' : 'create'}`
    );
  }

  return lines.join('\n');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const supabase = createClient(getRequiredEnv('SUPABASE_URL'), getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const baseUrl = getRequiredEnv('LISTMONK_URL').replace(/\/$/, '');
  const authHeader = buildAuthHeader(getRequiredEnv('LISTMONK_USERNAME'), getRequiredEnv('LISTMONK_PASSWORD'));
  const lanes = getManagedLanes(options.lanes);
  const laneLookup = buildLaneLookup(lanes);

  const [signups, lists, subscribers] = await Promise.all([
    fetchConfirmedSignups(supabase),
    fetchLists(baseUrl, authHeader),
    fetchSubscribers(baseUrl, authHeader),
  ]);

  const managedListMap = getManagedListMap(lanes, lists);
  const plan = buildSyncPlan(signups, subscribers, laneLookup, managedListMap);

  if (!options.apply) {
    console.log('Dry run only. Re-run with --apply to write changes.');
    console.log(summarizePlan(plan, managedListMap));
    return;
  }

  await applySyncPlan(baseUrl, authHeader, plan.filter((entry) => entry.finalListIds.length > 0));
  console.log('Applied subscriber sync.');
  console.log(summarizePlan(plan, managedListMap));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});