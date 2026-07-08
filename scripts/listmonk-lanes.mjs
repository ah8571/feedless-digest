export const laneDefinitions = {
  'ai-engineering': {
    slug: 'ai-engineering',
    label: 'AI engineering',
    senderName: 'Feedfree AI',
    listName: 'Feedfree AI',
    tags: ['ai-engineering', 'feedfree-ai'],
  },
  'open-source-intrigues': {
    slug: 'open-source-intrigues',
    label: 'Open Source Intrigues',
    senderName: 'Feedfree Open Source Intrigues',
    listName: 'Feedfree Open Source Intrigues',
    tags: ['open-source-intrigues', 'feedfree-open-source-intrigues'],
  },
  'crypto-investing': {
    slug: 'crypto-investing',
    label: 'Crypto Investing',
    senderName: 'Feedfree Crypto Investing',
    listName: 'Feedfree Crypto Investing',
    tags: ['crypto-investing', 'feedfree-crypto-investing'],
  },
  security: {
    slug: 'security',
    label: 'Security',
    senderName: 'Feedfree Security',
    listName: 'Feedfree Security',
    tags: ['security', 'feedfree-security'],
  },
  compliance: {
    slug: 'compliance',
    label: 'Compliance',
    senderName: 'Feedfree Compliance',
    listName: 'Feedfree Compliance',
    tags: ['compliance', 'feedfree-compliance'],
  },
  'early-founder-bootstrapping': {
    slug: 'early-founder-bootstrapping',
    label: 'Early founder bootstrapping',
    senderName: 'Feedfree Early Founder Bootstrapping',
    listName: 'Feedfree Early Founder Bootstrapping',
    tags: ['early-founder-bootstrapping', 'feedfree-early-founder-bootstrapping'],
  },
  'lead-generation': {
    slug: 'lead-generation',
    label: 'Lead Generation',
    senderName: 'Feedfree Lead Generation',
    listName: 'Feedfree Lead Generation',
    tags: ['lead-generation', 'feedfree-lead-generation'],
  },
  seo: {
    slug: 'seo',
    label: 'SEO',
    senderName: 'Feedfree SEO',
    listName: 'Feedfree SEO',
    tags: ['seo', 'feedfree-seo'],
  },
  'cold-outreach-marketing': {
    slug: 'cold-outreach-marketing',
    label: 'Cold outreach marketing',
    senderName: 'Feedfree Cold Outreach Marketing',
    listName: 'Feedfree Cold Outreach Marketing',
    tags: ['cold-outreach-marketing', 'feedfree-cold-outreach-marketing'],
  },
  'social-media-marketing': {
    slug: 'social-media-marketing',
    label: 'Social Media marketing',
    senderName: 'Feedfree Social Media Marketing',
    listName: 'Feedfree Social Media Marketing',
    tags: ['social-media-marketing', 'feedfree-social-media-marketing'],
  },
};

export function getLane(slug) {
  return laneDefinitions[slug] ?? null;
}

export function getLaneOrThrow(slug) {
  const lane = getLane(slug);
  if (!lane) {
    const supported = Object.keys(laneDefinitions).join(', ');
    throw new Error(`Unknown lane \"${slug}\". Supported lanes: ${supported}`);
  }
  return lane;
}

export function getLaneListName(lane) {
  return lane.listName;
}

export function getLaneSenderName(lane) {
  return lane.senderName;
}

export function getLaneTags(lane) {
  return [...lane.tags];
}

export function listSupportedLaneSlugs() {
  return Object.keys(laneDefinitions);
}