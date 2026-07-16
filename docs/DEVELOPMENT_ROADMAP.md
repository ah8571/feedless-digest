# Feedfree Digest Development Roadmap

- [x] Finish the website and domain setup.
- [ ] Start with Resend and authenticate the sending domain.
- [ ] Build the editorial queue in Airtable or Google Sheets.
- [ ] Research X and Reddit, Hacker News first.
- [ ] Wire the first ingestion workflow into the queue.
- [ ] Produce a sample issue and archive it on the site.

# Phase 1

## Part 1: Public Presence
- [x] Finalize the landing page messaging around the core promise: long-form signal without feed addiction.
- [x] Decide on the primary call to action: waitlist, live subscription, or sample issue.
- [ ] Replace temporary email links with a real signup flow.
- [x] Finalize the archive page structure so old issues can be published by date.
- [ ] Replace placeholder privacy and terms text before public launch.
- [x] Connect the site to a production domain and deploy it 
## Part 2: Subscriber Stack Foundations
- [ ] Connect the landing page signup flow to the production Supabase project.
- [ ] Run the latest `newsletter_signups` SQL so topic selections and confirmation fields match the app.
- [ ] Verify that new signups persist correctly in Supabase with the expected `topics`, `status`, and timestamps.
- [ ] Stand up the fundamentals of Listmonk:
  - [ ] confirm the server plan and environment variables
  - [ ] create the primary subscriber list
  - [ ] verify the public subscription endpoint shape and required fields
  - [ ] confirm how topic preferences should be passed in `attribs`
- [ ] Review the internal Listmonk docs and confirm we have the main API workflows documented:
  - [ ] create or update subscriber
  - [ ] attach subscriber to list
  - [ ] fetch subscriber details
  - [ ] manage custom attributes
  - [ ] create and send or schedule a campaign
  - [ ] handle unsubscribe and suppression behavior
- [ ] Identify any missing API notes in `docs/api-research/` or the Listmonk setup docs and fill those gaps.
- [ ] Prepare Resend for confirmation-email work:
  - [ ] create the account or confirm access
  - [ ] authenticate the sending domain
  - [ ] verify the sender identity to use for confirmations
## Part 3: Email Delivery Setup
- [ ] Start with Resend for transactional simplicity and fast setup.
- [ ] Verify domain ownership and configure SPF, DKIM, and DMARC.
- [ ] Create the sending identities needed for editorial and sponsorship workflows.
- [x] Choose the newsletter operating model:
  - [x] open-source publishing tool on a server later
  - [ ] lightweight hosted sending first
- [ ] Document the migration trigger from Resend to SES.
## Part 4: Source Ingestion MVP
- [ ] Start with Reddit and Hacker News
- [ ] Define source-specific heuristics before adding any AI filtering.
- [ ] Build the first automation in n8n, Make, or Python.
- [ ] Send raw candidates into the editorial queue instead of newsletter.
- [ ] Add deduplication before adding summarization.
- [ ] add AI scoring after the basic pipeline produces enough candidates.
- [ ] Create one document per source inside `docs/api-research/`.
- [ ] For each source, document:
  - [ ] official access path
  - [ ] full-text availability
  - [ ] useful metadata for scoring
  - [ ] rate limits and pricing
  - [ ] terms-of-use risk
  - [ ] fallback discovery path
  - [ ] minimum viable heuristics
- [ ] Record whether each source should be treated as:
  - [ ] first-class API integration
  - [ ] indirect discovery source
  - [ ] experimental source
- [ ] Revisit the priority order after the first research pass.
## Part 5: Editorial Operating System
- [ ] Choose Airtable or Google Sheets as the first editorial queue.
- [ ] Define the minimum fields for each candidate item:
  - [ ] source platform
  - [ ] source URL
  - [ ] author
  - [ ] title or hook
  - [ ] full-text availability
  - [ ] word count estimate
  - [ ] engagement metrics
  - [ ] date discovered
  - [ ] editorial status
  - [ ] issue assignment
- [ ] Create simple editorial states such as `new`, `reviewing`, `approved`, `rejected`, and `scheduled`.
- [ ] Define the daily review workflow so sourcing stays useful instead of becoming noise.
- [ ] Write the first issue template so curated items are easy to publish consistently.
## Part 6: Publishing Workflow
- [ ] Create a standard issue assembly format.
- [ ] Decide how much summary or commentary to add versus just linking out.
- [ ] Publish a first sample issue
- [ ] Add the published issue to the site archive.
## Part 7: Monetization Layer
- [ ] Keep the advertise page simple until you have audience data.
- [ ] Create a basic sponsor deck with positioning, issue concept, and expected reader profile.
- [ ] Define early inventory types:
  - [ ] single issue sponsorship
  - [ ] category exclusivity
  - [ ] archive placement
- [ ] Add actual pricing only after early audience metrics exist.


## later potential developments
- custom newsletter based on a person's interests (we can use the same engine)

- fix dmarc issues
- verify server side conversions are working


## Privacy regulations:
- GPC signal incorporation: 

GPC signal reference

The Global Privacy Control (GPC) signal is a standardized browser header (Sec-GPC: 1) or JavaScript property (navigator.globalPrivacyControl === '1') that allows users to broadcast a universal opt-out of the sale or sharing of their data [FTC.gov ftc.gov]. Under California's CCPA/CPRA, websites are legally required to honor this signal automatically.To engineer for GPC on your frontend, implement this simple detection script:javascript// 1. Check if the user has enabled Global Privacy Control
const isGpcEnabled = () => {
  return navigator.globalPrivacyControl === '1' || 
         navigator.globalPrivacyControl === true;
};

// 2. Control your tracking pipeline based on the signal
if (isGpcEnabled()) {
  console.log("GPC Signal Detected. Turning off third-party ad tracking pixels.");
  
  // Disable your X (Twitter) CAPI trigger or Server-Side click ID transmission
  window.disableThirdPartySharing = true; 
  
  // Set your local compliance state so your server knows not to share data
  localStorage.setItem('ccpa_opt_out', 'true');
} else {
  // Proceed with normal privacy-first operations
  window.disableThirdPartySharing = false;
}

What Your Backend Code Looks Like (The Server Check)If you are processing tracking on the server side, your backend should inspect the incoming HTTP requests for the Sec-GPC header before deciding whether to fire an ad network event:javascript// Example Node.js/Express server middleware
app.use((req, res, next) => {
  const gpcHeader = req.headers['sec-gpc'];
  
  if (gpcHeader === '1') {
    // Flag this user session as "Opted Out"
    req.session.isOptedOut = true;
  }
  next();
});

If a user with GPC enabled lands on your site from California, you must provide a visible confirmation message in the browser.Under the updated California Privacy Rights Act (CPRA) regulations (specifically section § 7025), if a business chooses to process user-agent signals (like GPC) instead of displaying a standard cookie banner, the website must provide a clear, visible response on the screen indicating that the signal was successfully detected and honored

Focus on UTM tracking with privacy oriented tools

Europe: unless you have cookies and someone actively consents to tracking, you can't send conversion events, can only look at things like utm tracking via plausible or posthog

Perhaps will not to focus ads in US / Canada for now; later consider europe tracking but with caution if we are tracking click id's 