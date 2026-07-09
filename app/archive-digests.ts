export type ArchiveDigestItem = {
  title: string;
  author: string;
  handle: string;
  date: string;
  source?: string;
  summary: string;
};

export type ArchiveIssue = {
  id: string;
  aliases?: string[];
  date?: string;
  title?: string;
  summary?: string;
  intro?: string;
  volumeNote?: string;
  disclosure?: string;
  items?: ArchiveDigestItem[];
};

export const aiEngineering001Issue: ArchiveIssue = {
  id: "ai-001",
  aliases: ["ai-engineering-001"],
  date: "July 8, 2026",
  title: "AI Engineering 001",
  summary:
    "Twelve high-signal X articles on loops, memory, harness design, and production AI agents, preserved with summaries and source links.",
  intro:
    "Hey, providing these articles below in case people missed them. There are many interesting articles floating around X, but they are easy to miss. Here are summaries and links in case helpful.",
  volumeNote:
    "This set includes 12 informational articles published between June 7 and July 6, 2026.",
  disclosure:
    "[disclosure: for efficiency, this was written with AI with human article selection. If you would like to see more lists with the latest AI advice, please subscribe to the newsletter]",
  items: [
    {
      title: "Getting started with loops",
      author: "ClaudeDevs",
      handle: "@ClaudeDevs",
      date: "July 6, 2026",
      source: "https://x.com/ClaudeDevs/article/2074208949205881033",
      summary:
        "ClaudeDevs gives one of the clearest definitions of loop design: an agent repeats work until a stop condition is met, rather than just answering a prompt once. The article maps out turn-based, goal-based, time-based, and proactive loops, and explains what kind of work fits each one. Its main value is practical: better verification, better stopping rules, and better skills are what keep autonomy useful instead of wasteful.",
    },
    {
      title: "Loop Engineering - From Prompting to Looping",
      author: "kaize",
      handle: "@0x_kaize",
      date: "July 4, 2026",
      source: "https://x.com/0x_kaize/article/2073438517775003671",
      summary:
        "From there, kaize pushes the idea further and treats loop engineering as the shift from one-off prompting to programmable agents that can wake up, find work, and return results on their own. The article walks through a concrete local setup with task discovery, gates, verification, and human review. It reads like a build guide for anyone who wants to move from theory into an actual repeatable system.",
    },
    {
      title:
        "How to Set Up Claude Loops That Keep Working While You Sleep (Step by Step)",
      author: "Hanako",
      handle: "@hanakoxbt",
      date: "June 13, 2026",
      source: "https://x.com/hanakoxbt/article/2065807526268920103",
      summary:
        "Hanako stays close to the operator view and explains loops as scheduled Claude jobs that keep running after the laptop closes. The article makes the strongest case for many narrow loops in parallel rather than one oversized do-everything agent. It also keeps emphasizing a good constraint: start small, make the stop condition obvious, and keep human approval on anything risky.",
    },
    {
      title: "A Field Guide to Fable: Finding Your Unknowns",
      author: "Thariq",
      handle: "@trq212",
      date: "July 3, 2026",
      source: "https://x.com/trq212/article/2073100352921215386",
      summary:
        "Thariq shifts the focus from automation to judgment and argues that Fable is often limited less by the model than by the user's unresolved unknowns. The article breaks those unknowns into categories and shows how they surface before, during, and after implementation. The useful takeaway is that stronger agentic work often comes from exposing ambiguity early instead of pretending the prompt already contains the whole plan.",
    },
    {
      title: "I Gave My Second Brain 1,500 Conversations and It Changed Everything",
      author: "leopardracer",
      handle: "@leopardracer",
      date: "July 4, 2026",
      source: "https://x.com/leopardracer/article/2073340097051689327",
      summary:
        "That naturally leads into memory, and leopardracer explores a second-brain setup built from notes, articles, Claude chats, and Claude Code history. The system turns that material into a living wiki that agents can both read and update, so the knowledge base compounds over time. The bigger claim here is not just better recall, but better thinking: the system is meant to generate new ideas, not merely store old ones.",
    },
    {
      title: "How to Turn Claude Code Into a Full Team of Specialists:",
      author: "Madni Aghadi",
      handle: "@hey_madni",
      date: "June 22, 2026",
      source: "https://x.com/hey_madni/article/2069010198040326329",
      summary:
        "Madni takes the memory problem in a more commercial direction and starts with a familiar frustration: Claude Code forgets your conventions every session. The article presents ClaudeKit as a marketplace of specialist kits that package commands, skills, subagents, and workflow knowledge for distinct roles. The pitch is straightforward but compelling: prebuilt domain context turns a generic assistant into a reusable operator for recurring work.",
    },
    {
      title: "How to Build Independent AI Agents That Actually Work in Production",
      author: "Sumanth",
      handle: "@Sumanth_077",
      date: "July 2, 2026",
      source: "https://x.com/Sumanth_077/article/2072679526556189021",
      summary:
        "Sumanth zooms out from individual operator setups and asks what happens when agents become shared organizational actors instead of personal chat tools. Using Claude Tag as the entry point, the article argues that production-ready AI coworkers need shared state, continuity, memory, identity, and accountability. It is one of the more useful pieces in this set for people thinking beyond solo workflows and into team-wide systems.",
    },
    {
      title:
        "10 hidden Claude skills built a $40,000 month while everyone else still types prompts by hand.",
      author: "Spike 1%",
      handle: "@SpikeCalls",
      date: "June 7, 2026",
      source: "https://x.com/SpikeCalls/article/2063606252999958726",
      summary:
        "SpikeCalls brings the discussion back to leverage and makes the case that the edge now comes from reusable Claude skills, not endless hand-written prompting. The article highlights a marketplace of skills for content, AEO, landing pages, finance, memory, and security. It is more of a monetization-oriented roundup than a systems essay, but it is useful as a snapshot of how the skills layer is being packaged and sold.",
    },
    {
      title: "Stop Being the Loop. Here's How to Make Claude Work While You Sleep.",
      author: "Raytar",
      handle: "@Raytar",
      date: "June 23, 2026",
      source: "https://x.com/Raytar/article/2069212188619805179",
      summary:
        "Raytar returns to a simpler but important insight: in many workflows, the human is still the actual loop because they keep checking, retrying, and deciding the next step manually. The article uses hallucinated citations as the clearest example of why one-shot prompting breaks down and why measurable verification matters. Its strongest point is that loop design is really about offloading the checking-and-deciding cycle, not just the first draft of the work.",
    },
    {
      title: "20 CLAUDE.md Rules for Getting Ahead of Your Competitors by 5 Years",
      author: "Cosmo",
      handle: "@0xCosmoo",
      date: "July 2, 2026",
      source: "https://x.com/0xCosmoo/article/2072751013031985423",
      summary:
        "Cosmo narrows the lens again and focuses on CLAUDE.md as persistent working memory across sessions. The article is broader than coding and shows how the same file can preserve voice, structure, preferences, and operating context for writers, marketers, researchers, and business owners. The core argument is simple and practical: better defaults reduce repetition, reduce correction, and compound into faster high-context work.",
    },
    {
      title:
        "ANTHROPIC RAN THE SAME MODEL TWICE. ONE HARNESS SPENT $200 A RUN, THE OTHER SPENT $9.",
      author: "belorix",
      handle: "@0xbelorix",
      date: "July 5, 2026",
      source: "https://x.com/0xbelorix/article/2073854908772839456",
      summary:
        "belorix picks up on the harness question directly and argues that the surrounding system often matters more than the model itself. The article focuses on stop conditions, rejection rules, and verification layers as the real reason one autonomous run becomes useful while another becomes expensive noise. That framing is helpful because it redirects attention from model hype to the operational design that actually controls cost and quality.",
    },
    {
      title:
        "The Claude Fable 5 Playbook: How to Get the Most Out of Anthropic's Strongest Model",
      author: "rvaniaaa",
      handle: "@rvaniaaaa",
      date: "July 4, 2026",
      source: "https://x.com/rvaniaaaa/article/2073439189685633533",
      summary:
        "rvaniaaa closes the set by arguing that Fable only looks overrated if you judge it on tasks that smaller models already handle well. The article says the real advantage appears when the work gets larger, messier, and more interconnected, with more tradeoffs surfacing along the way. It is a useful ending note for the whole batch because it reinforces the same broader theme running through many of these pieces: model quality matters, but the real gains show up when the workflow, memory, and problem framing are strong enough to let that quality matter.",
    },
  ],
};