export type ArchiveDigestItem = {
  title: string;
  author: string;
  handle: string;
  date: string;
  source?: string;
  summary?: string;
};

export type ArchiveIssue = {
  id: string;
  aliases?: string[];
  series?: string;
  date?: string;
  title?: string;
  summary?: string;
  intro?: string;
  body?: string[];
  volumeNote?: string;
  disclosure?: string;
  itemsTitle?: string;
  items?: ArchiveDigestItem[];
};

export const aiEngineering001Issue: ArchiveIssue = {
  id: "ai-001",
  aliases: ["ai-engineering-001"],
  series: "AI Engineering",
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

export const aiEngineering002Issue: ArchiveIssue = {
  id: "ai-002",
  aliases: ["ai-engineering-002"],
  series: "AI Engineering",
  date: "July 8, 2026",
  title: "AI Engineering 002",
  summary:
    "23 X articles on loop ownership, reliability, memory, infrastructure, and trust, presented in the linked grouped format used in the newsletter.",
  intro:
    "Yesterday was a busy day for AI engineering advice X articles. A lot of people are describing the same change from different angles. We have summarized the key points below and linked the articles inline so you can read further.",
  body: [
    "The interesting work is no longer about one perfect prompt. It is about building systems with loops, memory, review, recovery, infrastructure, and boundaries strong enough to let autonomy be useful instead of reckless.",
    "The dominant theme was loop engineering. [Own the Outer Loop](https://x.com/addyosmani/status/2074927530482835916) gives the clearest statement of the problem: as models get more capable, the hard part is not generating output but owning accountability for what the system does. Addy frames that with quality checks, verdicts, and answerability, which complements [Everything about loop engineering](https://x.com/Hartdrawss/status/2074870641829023864), where the loop is described more practically as a goal, a way to test progress, and a stopping rule. Together they make the same point from two levels: loops are not magic autonomy, they are structured responsibility.",
    "That same idea gets sharper once the conversation moves from prompting to context. [Context Engineering: the Karpathy-Cherny method that replaced prompting](https://x.com/vartekxx/status/2074864291568664646) argues that the real program is the context window, not the one instruction you type at the top. [The Karpathy Method: How to Stop Prompting and Make AI Work While You Sleep](https://x.com/nikskld/status/2074827837383532763) then shows what that looks like in practice: one agent running experiments, another evaluating outcomes, and the whole system improving because the environment is designed well enough for iteration. [From Loops to Flywheels](https://x.com/conroywhitney/status/2074850314247639167) adds the business lens by treating loops as compounding systems rather than isolated runs, while [Loop Engineering: the Boris Cherny Method](https://x.com/choopyplug1/status/2074879612765503774) and [The ascension of loops: from terminals to VMs](https://x.com/CKGrafico/status/2074815381223457265) push the conversation toward repeatability, separation between maker and checker, and the need to move long-running loops onto more stable infrastructure.",
    "The next conversation was about what happens when those loops meet production instead of theory. [My AI Bot Broke 5 Ways in Front of Real People. Loop Claude Tutorials Won't Show You Any of Them.](https://x.com/Rencrypta/status/2074923035837038882) is valuable precisely because it documents the polite, credibility-burning failures that polished demos skip. That pairs well with [How to build a self-healing agent loop](https://x.com/trylatitude/status/2074874164951777776), which shows the next step beyond passive monitoring: let a system detect regressions, open an incident, and draft a fix before the cost leak turns into a monthly surprise. [Self-Optimizing Coding Agent Harnesses with SuperQode](https://x.com/Shashikant86/status/2074843395751649719), [Loops: How to Make Claude Fix Its Own Work Before You See It](https://x.com/0xchromium/status/2074831700291355120), and [Harness Engineering: How I built a Self-Improving Loop for Coding Agents on top of Karpathy Loop](https://x.com/anshstwt/status/2074894728534032597) all reinforce the same lesson: the leverage shows up when you stop treating failure as a one-off mistake and start feeding it back into the system as reusable constraint data.",
    "A follow-up to loop engineering is memory discussion. [How to Build a Second Brain with Karpathy's Method (Claude + Obsidian)](https://x.com/kirillk_web3/status/2074905017983607081) treats a knowledge base less like reference storage and more like a compiled working system that gets stronger as it is used. [Hermes Agent FULL GUIDE: Give Hermes a company brain so it can collaborate with your teammates](https://x.com/Box/status/2074946896859463700) takes the same idea into collaborative workflows, while [Mac Mini + Claude = MegaBrain that builds itself.](https://x.com/0xfuckpoverty/status/2074826862560170301), [Knowledge Systems Beat Prompting](https://x.com/rateblab/status/2074822978013893046), and [Your AI Agent Has Amnesia. Turn Obsidian Into Its Long-Term Memory.](https://x.com/paydird/status/2074816419745628462) all circle the same conclusion: the winners are not the people with the cleverest prompts, but the people who turn scattered notes, docs, and repeated workflows into durable memory the model can actually navigate.",
    "That leads naturally into infrastructure. [We made 6 hires this year. All of them are AI. They share one brain.](https://x.com/ali_ilhami/status/2074939384768446578) is a useful case study because it shows where multi-agent systems break first: duplicated knowledge, split canons, and no one maintaining coherence. [Building a Production-Grade Agentic AI Platform on AWS Bedrock AgentCore](https://x.com/inetgas/status/2074867840058900600) answers that from the enterprise side with scoped identity, auditability, and observability, while [KARS (Kubernetes Agent Reference Stack) Makes Agents Look Like Real Infrastructure](https://x.com/BradGroux/status/2074872310465474927) and [Towards Infinite Context at the Limit: Why Conditioning Is More Important Than Length](https://x.com/fabianfranz/status/2074911876618592465) both show that better systems come less from raw model strength than from disciplined routing, structure, and conditioning. [Memory Safety Isn’t Enough: Benchmarking What Agents Should Forget, Not Just What They Retrieve](https://x.com/Aetna000/status/2074885363810849045) sharpens that point by arguing that trustworthy agents need selective forgetting, not just better recall.",
    "The last thread widened the lens again. [Grand Unified Theory of Tech Ambivalence](https://x.com/NateBuild/status/2074831298598768670), [at what point does ai become a parasite on the internet it was trained on?](https://x.com/PratyooshBhatia/status/2074970529547886778), [Building an Explainable AI Deepfake Analyzer for Sensitive Media Abuse](https://x.com/JHALA_D_S/status/2074827203796476248), [AI Safety Analysis 2026](https://x.com/ICC_Chamber/status/2074824740062339542), and [PatchPilot: the Claude Code hook that vets npm packages before they install](https://x.com/DrFloSteiner/status/2074824299345576052) all pull the engineering conversation back toward legitimacy. The underlying message is that better agents do not matter much if trust erodes around provenance, package safety, exploitability, or the quality of the underlying information layer.",
  ],
  volumeNote: "This set includes 23 AI informational articles published on July 8, 2026.",
  itemsTitle: "Links-first version",
  disclosure:
    "[disclosure: this was written with AI with human edits and article selection. If you would like to see more articles like this, please subscribe to my free newsletter in the bio]",
  items: [
    {
      title: "Add Voice to your AI Agents",
      author: "ElevenLabs Developers",
      handle: "@ElevenLabsDevs",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074918801720684544",
    },
    {
      title: "Own the Outer Loop",
      author: "Addy Osmani",
      handle: "@addyosmani",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074573342187868160",
    },
    {
      title: "Everything about loop engineering",
      author: "Harshil Tomar",
      handle: "@Hartdrawss",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2072673813029130241",
    },
    {
      title: "Context Engineering: the Karpathy-Cherny method that replaced prompting",
      author: "vartekx",
      handle: "@vartekxx",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074824432510521344",
    },
    {
      title: "The Karpathy Method: How to Stop Prompting and Make AI Work While You Sleep",
      author: "nik skld",
      handle: "@nikskld",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074826086517440512",
    },
    {
      title: "From Loops to Flywheels",
      author: "YOЯNOC",
      handle: "@conroywhitney",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074849433661898752",
    },
    {
      title: "Loop Engineering: the Boris Cherny Method - system that prompts your coding agent for you",
      author: "chuplung",
      handle: "@choopyplug1",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074581898320572416",
    },
    {
      title: "The ascension of loops: from terminals to VMs",
      author: "Quique Fdez Guerra",
      handle: "@CKGrafico",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2073488972102119424",
    },
    {
      title: "My AI Bot Broke 5 Ways in Front of Real People. Loop Claude Tutorials Won't Show You Any of Them.",
      author: "Rencrypta.eth",
      handle: "@Rencrypta",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074845468803133440",
    },
    {
      title: "How to build a self-healing agent loop",
      author: "Latitude.so",
      handle: "@trylatitude",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074840547068379136",
    },
    {
      title: "Self-Optimizing Coding Agent Harnesses with SuperQode",
      author: "Shashi",
      handle: "@Shashikant86",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074840993312985088",
    },
    {
      title: "Loops: How to Make Claude Fix Its Own Work Before You See It",
      author: "Chrome",
      handle: "@0xchromium",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074530301473075200",
    },
    {
      title: "Harness Engineering: How I built a Self-Improving Loop for Coding Agents on top of Karpathy Loop",
      author: "Ansh Saxena",
      handle: "@anshstwt",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074036738914447360",
    },
    {
      title: "How to Build a Second Brain with Karpathy's Method (Claude + Obsidian)",
      author: "Kirill",
      handle: "@kirillk_web3",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074471157466562560",
    },
    {
      title: "Hermes Agent FULL GUIDE: Give Hermes a company brain so it can collaborate with your teammates",
      author: "Box",
      handle: "@Box",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2067023830770683904",
    },
    {
      title: "Mac Mini + Claude = MegaBrain that builds itself.",
      author: "broke boy",
      handle: "@0xfuckpoverty",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074756568126496768",
    },
    {
      title: "Knowledge Systems Beat Prompting",
      author: "Rateb",
      handle: "@rateblab",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074822612761341952",
    },
    {
      title: "Your AI Agent Has Amnesia. Turn Obsidian Into Its Long-Term Memory.",
      author: "paydird",
      handle: "@paydird",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074774683820445696",
    },
    {
      title: "We made 6 hires this year. All of them are AI. They share one brain.",
      author: "Ali Ilhami Oztan",
      handle: "@ali_ilhami",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074931521560207360",
    },
    {
      title: "Building a Production-Grade Agentic AI Platform on AWS Bedrock AgentCore",
      author: "Stanley Wang",
      handle: "@inetgas",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074819851776901120",
    },
    {
      title: "KARS (Kubernetes Agent Reference Stack) Makes Agents Look Like Real Infrastructure",
      author: "Brad Groux",
      handle: "@BradGroux",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074865928680914944",
    },
    {
      title: "Towards Infinite Context at the Limit: Why Conditioning Is More Important Than Length",
      author: "Fabian Franz",
      handle: "@fabianfranz",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074909575958945792",
    },
    {
      title: "Memory Safety Isn’t Enough: Benchmarking What Agents Should Forget, Not Just What They Retrieve",
      author: "Aetna Hayes",
      handle: "@Aetna000",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074884676225998848",
    },
  ],
};

export const socialMediaMarketing001Issue: ArchiveIssue = {
  id: "social-001",
  aliases: ["social-media-marketing-001"],
  series: "Social Media Marketing",
  date: "July 8, 2026",
  title: "Social Media Marketing 001",
  summary:
    "15 X articles on distribution, content systems, production pipelines, and trust, presented in the linked grouped format used in the newsletter.",
  intro:
    "Yesterday was a busy day for social media marketing articles on X. The useful posts were less about one grand framework and more about a set of operators comparing notes on distribution, creative systems, and what the current attention economy is doing to both creators and audiences.",
  body: [
    "Taken together, these articles suggest that social media marketing is becoming a systems discipline, but one with a more obvious human ceiling. Better distribution, sharper hooks, richer content inputs, and faster production all matter. But so do trust, pacing, and the sense that something on the other side of the screen still feels authored instead of manufactured.",
    "The strongest throughline was still distribution. [DISTRIBUITION](https://x.com/whotfiszackk/status/2074906024998551743) makes the blunt case that content quality is secondary if nobody sees the work in the first place, and that idea gets more concrete in [the psychology behind 6-figure content funnels](https://x.com/thenathanlopes/status/2074851836293771322), where first impressions, thin-slice judgment, and perceived status are treated as conversion infrastructure rather than soft branding talk. [How ONE video booked 101 calls & generated $25,000 cash collected](https://x.com/dfysanskar/status/2074853779598459184) gives that argument a direct case study: the result did not come from one lucky upload, but from an engineered system for hooks, scripts, filtering, and offer alignment.",
    "Other growth strategy articles feel less like isolated hacks and more like operating procedures. [every viral AI video format explained in 1 article](https://x.com/johnvirality/status/2074886930479620587) breaks virality into repeatable patterns rather than vibes. [how to generate infinite linkedin content ideas with sonnet 5.0](https://x.com/paolo_scales/status/2074884615509012629) argues that consistency comes from feeding a model rich business context, not waiting for inspiration. [The High-Leverage Feed: Top 10 Elites to Follow on X if You Are Actively Building a Business](https://x.com/onlypreneurs/status/2074831188188111085) shifts the focus toward environment design by asking who you learn from every day, while [Pinterest SEO 101: How It Really Works in 2026 (and What Changes with AI)](https://x.com/seocopydebby/status/2074855878117728327) and [How to earn $$$ with clips (and unlock rev share faster)](https://x.com/tonjkb/status/2074694031884365993) show that growth now depends on understanding platform-specific discovery mechanics instead of assuming one audience strategy works everywhere.",
    "The next conversation was about production, especially video. [The AI Anime Blueprint: From Concept to Production Pipeline (Tutorial & Prompts Included)](https://x.com/apob_ai/status/2074790408823902415) is useful because it shows how detailed structure creates consistent output instead of one-off novelty. [AI video in 2026: Sora, Veo, Runway, Kling, Luma, HeyGen... who does what?](https://x.com/PanachesApp/status/2074761677904478391) plays a different role by helping people think in tool stacks rather than brand hype, and [UGC without the creators](https://x.com/Sogni_Protocol/status/2074775295593181184) captures the tension at the center of this space: creator-style output is increasingly systematized, which makes scale easier but also raises harder questions about authenticity and what audiences are actually responding to.",
    "That tension is exactly where the reflective commentary section becomes useful. [My semi-complicated relationship with social media](https://x.com/daRubberDuckiee/status/2074931606931083767) brings in the creator's internal view of a long relationship with platforms, ambition, and identity. [AI Slop, a generational marketing op, and the emerging trust crisis](https://x.com/wbelk/status/2074884868987654486) pushes harder by arguing that unlimited output is not automatically a good, especially when the system rewards quantity before discernment. [Nothing Feels Real Anymore](https://x.com/azzzerae/status/2074887560275407175) and [The Space Between Notifications: Why Stillness Matters More Than Ever](https://x.com/BIZBoost/status/2074835860026183789) both complement that critique by asking what gets lost when content turns into constant throughput. The useful marketing takeaway is not just moral caution. It is strategic caution: if audiences feel overstimulated, manipulated, or unable to trust what they are seeing, the marginal value of more output starts to fall.",
  ],
  volumeNote: "This set includes 15 informational articles published on July 8, 2026.",
  itemsTitle: "Links-first version",
  disclosure:
    "[disclosure: this was written with AI with human article selection. If you would like to see more articles like this, please subscribe to our free newsletter in the bio]",
  items: [
    {
      title: "DISTRIBUITION",
      author: "zack",
      handle: "@whotfiszackk",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074904052027289600",
    },
    {
      title: "the psychology behind 6-figure content funnels",
      author: "Nate",
      handle: "@thenathanlopes",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074705922857865217",
    },
    {
      title: "every viral AI video format explained in 1 article",
      author: "John",
      handle: "@johnvirality",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074884895202017280",
    },
    {
      title: "how to generate infinite linkedin content ideas with sonnet 5.0",
      author: "paolo trivellato",
      handle: "@paolo_scales",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074881299429326848",
    },
    {
      title: "The High-Leverage Feed: Top 10 Elites to Follow on X if You Are Actively Building a Business",
      author: "Startup Lessons",
      handle: "@onlypreneurs",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074207004521041920",
    },
    {
      title: "how ONE video booked 101 calls & generated $25,000 cash collected",
      author: "Sanskar",
      handle: "@dfysanskar",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074476309212790784",
    },
    {
      title: "Pinterest SEO 101: How It Really Works in 2026 (and What Changes with AI)",
      author: "Debora Tesauro",
      handle: "@seocopydebby",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074852596720795648",
    },
    {
      title: "How to earn $$$ with clips (and unlock rev share faster)",
      author: "Tony Jacob | FindaClip.com",
      handle: "@tonjkb",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074581418886287360",
    },
    {
      title: "The AI Anime Blueprint: From Concept to Production Pipeline (Tutorial & Prompts Included)",
      author: "apob",
      handle: "@apob_ai",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074786944803074048",
    },
    {
      title: "AI video in 2026: Sora, Veo, Runway, Kling, Luma, HeyGen... who does what?",
      author: "Panaches",
      handle: "@PanachesApp",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074761135442505728",
    },
    {
      title: "UGC without the creators",
      author: "Sogni.ai",
      handle: "@Sogni_Protocol",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074739407903436800",
    },
    {
      title: "My semi-complicated relationship with social media",
      author: "Jess",
      handle: "@daRubberDuckiee",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074923601153961984",
    },
    {
      title: "AI Slop, a generational marketing op, and the emerging trust crisis",
      author: "William Belk",
      handle: "@wbelk",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074712146651316224",
    },
    {
      title: "Nothing Feels Real Anymore",
      author: "AZZERAE",
      handle: "@azzzerae",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074171278609768451",
    },
    {
      title: "The Space Between Notifications: Why Stillness Matters More Than Ever",
      author: "BIZBoost",
      handle: "@BIZBoost",
      date: "July 8, 2026",
      source: "https://x.com/i/article/2074831470963879936",
    },
  ],
};

export const aiEngineering003Issue: ArchiveIssue = {
  id: "ai-003",
  aliases: ["ai-engineering-003"],
  series: "AI Engineering",
  date: "July 12, 2026",
  title: "AI Engineering 003",
  summary:
    "10 X articles on harness design, prompting, memory systems, loop engineering, and toolsets.",
  intro:
    "Plenty of useful AI engineering writing is still easy to miss on X. Below are summaries and links to the pieces we found most useful from July 11.",

  itemsTitle: "Links-first version",
  disclosure:
    "[disclosure: this was written with AI with human edits and article selection. If you would like to see more articles like this, please subscribe to our newsletter]",
};

export const socialMediaMarketing002Issue: ArchiveIssue = {
  id: "social-002",
  aliases: ["social-media-marketing-002"],
  series: "Social Media Marketing",
  date: "July 12, 2026",
  title: "Social Media Marketing 002",
  summary:
    "11 X articles on TikTok growth, AI video production, X growth, ad structure, and YouTube strategy.",
  intro:
    "Growing on X, TikTok or other channels can be a serious challenge for most of us. However below you will see articles written by those with significant success using social media to drive their products or services. For instance a push-up app designed to get people to stop doomscrolling just cleared 1 million ARR. Everyday people are creating apps and monetizing channels in ways it would have never been possible several years ago. Take a look at the summaries below and check out their respective articles if you want to learn more.",

  itemsTitle: "Links-first version",
  disclosure:
    "[disclosure: this was written with AI with human edits and article selection. If you would like to see more articles like this, please subscribe to our newsletter]",
};

export const seo001Issue: ArchiveIssue = {
  id: "seo-001",
  aliases: ["seo-001"],
  series: "SEO",
  date: "July 12, 2026",
  title: "SEO 001",
  summary:
    "13 X articles on ranking in AI overviews, agent-assisted SEO workflows, and social media SEO.",
  intro:
    "Search is changing fast. This first SEO edition collects the most practical writing from July 11 on AI overview visibility, agent SEO workflows, and platform-specific search optimization.",

  itemsTitle: "Links-first version",
  disclosure:
    "[disclosure: this was written with AI with human edits and article selection. If you would like to see more articles like this, please subscribe to our newsletter]",
};