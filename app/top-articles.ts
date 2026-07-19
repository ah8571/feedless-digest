/**
 * Top curated X Articles for the landing page.
 *
 * Data sourced from the most recent edition's X Article posts.
 * Updated manually when a new edition ships.
 */

export interface TopArticle {
  id: string;
  title: string;
  authorHandle: string;
  summary: string;
  date: string;
  xUrl: string;
}

export const topArticles: TopArticle[] = [
  {
    id: "2077156239059107867",
    title: "AI for Enterprise Finance & How to Do It Right",
    authorHandle: "vasuman",
    summary:
      "Real results from Fortune 500 finance AI deployments: close dropped from 12 days to 5, exception handling from 130 hrs/month to 20. Good finance agents are ~85% plain code, ~15% model calls.",
    date: "2026-07-14",
    xUrl: "https://x.com/vasuman/status/2077156239059107867",
  },
  {
    id: "2076938757744513276",
    title: "Animating Your Ideas: The Complete AI Anime Playbook",
    authorHandle: "apob_ai",
    summary:
      "A production-grade AI anime workflow: build the character, create the world, storyboard, edit continuity, then animate with direction. Structured pre-production beats longer prompts every time.",
    date: "2026-07-14",
    xUrl: "https://x.com/apob_ai/status/2076938757744513276",
  },
  {
    id: "2077114326985687525",
    title: "The Dark Arts of Skill Engineering",
    authorHandle: "pbakaus",
    summary:
      "Nine advanced techniques for building agent skills that work across models and harnesses. Use adversarial sub-agents for review, compile per harness, and add PostToolUse hooks as unskippable guardrails.",
    date: "2026-07-14",
    xUrl: "https://x.com/pbakaus/status/2077114326985687525",
  },
  {
    id: "2076956122511016391",
    title: "Mastering AI K-Pop Dance Covers: The Smarter Workflow for Creators",
    authorHandle: "Ambani_Wessley",
    summary:
      "Move from random AI dance clips to a structured production system. Build the dancer, shape the look, control identity, and guide the movement before the video begins.",
    date: "2026-07-14",
    xUrl: "https://x.com/Ambani_Wessley/status/2076956122511016391",
  },
];
