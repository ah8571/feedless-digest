/**
 * Top curated X Articles for the landing page.
 *
 * Data sourced from the most recent edition's X Article posts,
 * ranked by impressions. Updated manually when a new edition ships.
 *
 * To refresh: fetch article titles + metrics + author avatars
 * from X API v2, then update this array.
 */

export interface TopArticle {
  id: string;
  title: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  impressions: number;
  likes: number;
  date: string;
  xUrl: string;
}

export const topArticles: TopArticle[] = [
  {
    id: "2077156239059107867",
    title: "AI for Enterprise Finance & How to Do It Right",
    authorName: "vas",
    authorHandle: "vasuman",
    authorAvatar:
      "https://pbs.twimg.com/profile_images/2010923246896414720/9im3sVCv_normal.jpg",
    impressions: 147_211,
    likes: 334,
    date: "2026-07-14",
    xUrl: "https://x.com/vasuman/status/2077156239059107867",
  },
  {
    id: "2076938757744513276",
    title: "Animating Your Ideas: The Complete AI Anime Playbook",
    authorName: "apob",
    authorHandle: "apob_ai",
    authorAvatar:
      "https://pbs.twimg.com/profile_images/1730025089964638208/SOr5IIp-_normal.jpg",
    impressions: 120_808,
    likes: 295,
    date: "2026-07-14",
    xUrl: "https://x.com/apob_ai/status/2076938757744513276",
  },
  {
    id: "2077114326985687525",
    title: "The Dark Arts of Skill Engineering",
    authorName: "Paul Bakaus",
    authorHandle: "pbakaus",
    authorAvatar:
      "https://pbs.twimg.com/profile_images/1550292580117622784/cT3WhwXw_normal.jpg",
    impressions: 110_510,
    likes: 391,
    date: "2026-07-14",
    xUrl: "https://x.com/pbakaus/status/2077114326985687525",
  },
  {
    id: "2076956122511016391",
    title:
      "Mastering AI K-Pop Dance Covers: The Smarter Workflow for Creators",
    authorName: "Ambani_Wessley",
    authorHandle: "Ambani_Wessley",
    authorAvatar:
      "https://pbs.twimg.com/profile_images/2016408593658990592/iRSr9hqz_normal.jpg",
    impressions: 61_891,
    likes: 190,
    date: "2026-07-14",
    xUrl: "https://x.com/Ambani_Wessley/status/2076956122511016391",
  },
];
