# Zero-Click Search Audit Checklist

> **Purpose:** Audit your website's exposure to zero-click search and AI Overviews, then fix the gaps.
> **Author:** Gagan Deep | AI Engineer
> **Repository:** [ai-automation-blueprints](https://github.com/themindfulnl-cmd/ai-automation-blueprints)

---

## The Problem

In 2026, **69% of Google searches** end without a single click. When AI Overviews appear, that number jumps to **83%**. If you are not actively tracking and adapting to this, your organic traffic is silently disappearing.

This checklist walks you through a complete audit in under 2 hours.

---

## Phase 1: Visibility Infrastructure (30 min)

### Google Search Console

- [ ] Property verified and active
- [ ] All sitemaps submitted and indexed (check Coverage report)
- [ ] Search Appearance → filter by "AI Overviews" (if available in your region)
- [ ] Export top 100 queries → note which ones have CTR below 2%
- [ ] Compare CTR trends: last 28 days vs. previous 28 days
- [ ] Identify queries where impressions are high but clicks are near zero

### Google Analytics 4

- [ ] GA4 connected and receiving data
- [ ] Organic search traffic segment created
- [ ] Landing page report filtered by organic — note pages losing traffic
- [ ] Set up custom exploration: Organic CTR over time
- [ ] Check referral traffic from AI sources (chat.openai.com, perplexity.ai)

### Google Business Profile

- [ ] All locations claimed and verified
- [ ] Business name, address, phone (NAP) consistent across all listings
- [ ] Categories set correctly (primary + secondary)
- [ ] Business description filled (750 characters, keyword-rich)
- [ ] Photos uploaded (exterior, interior, team, products — minimum 10)
- [ ] Q&A section populated with your own FAQs
- [ ] Posts published in the last 7 days
- [ ] Reviews: responding to all reviews within 48 hours

### Google Ads (Keyword Planner Access)

- [ ] Google Ads account active (you do NOT need to run ads)
- [ ] Keyword Planner accessible
- [ ] Export keyword ideas for your top 20 service/product terms
- [ ] Note search volume trends — declining volume = AI is absorbing that traffic

---

## Phase 2: Authority Signals (30 min)

### Backlink Profile

- [ ] Check current Domain Authority / Domain Rating (Moz, Ahrefs, or Ubersuggest free tier)
- [ ] Count referring domains — benchmark: you need 50+ for meaningful AI citation chance
- [ ] Identify your top 5 backlinks by authority — are they relevant to your niche?
- [ ] Check for toxic or spammy backlinks — disavow if needed
- [ ] List 5 competitor sites that rank for your target queries
- [ ] Check where competitors are getting their backlinks (Ahrefs Backlink Gap tool)

### Guest Posting Pipeline

- [ ] Identified 10+ target sites for guest posting (DA 30+)
- [ ] Sent at least 5 pitches this month
- [ ] Published at least 1 guest post with a contextual backlink
- [ ] Author bio links point to your highest-converting page (not homepage)
- [ ] All published guest posts submitted to Search Console for indexing

### Local Directory Listings

- [ ] Business listed on Google Maps
- [ ] Business listed on Bing Places
- [ ] Business listed on Apple Maps Connect
- [ ] Business listed on relevant industry directories
- [ ] NAP (Name, Address, Phone) identical across all directories
- [ ] Listings include link back to your website

---

## Phase 3: Structured Data / GEO (30 min)

### JSON-LD Schemas

- [ ] `LocalBusiness` schema on every page (or at minimum the homepage)
- [ ] `FAQPage` schema on FAQ and service pages
- [ ] `Course` / `Product` / `Service` schema for your offerings
- [ ] `Organization` schema with `sameAs` links to all social profiles
- [ ] `BreadcrumbList` schema for site navigation
- [ ] All schemas validated at [validator.schema.org](https://validator.schema.org)
- [ ] All schemas validated in Google Rich Results Test
- [ ] No errors or warnings in structured data reports (Search Console → Enhancements)

### Content Architecture

- [ ] H1 tags are question-based (not generic like "Our Services")
- [ ] Each key page answers ONE specific question thoroughly
- [ ] Content includes the exact phrasing people use in voice/AI queries
- [ ] Bilingual content available (if serving multilingual markets)
- [ ] FAQ sections use the actual questions your customers ask
- [ ] Content length: 800+ words for pillar pages

### Technical SEO

- [ ] Core Web Vitals passing (check PageSpeed Insights or GTMetrix)
- [ ] LCP (Largest Contentful Paint) under 2.5 seconds
- [ ] CLS (Cumulative Layout Shift) under 0.1
- [ ] FID/INP under 200ms
- [ ] Mobile-friendly (Google Mobile-Friendly Test)
- [ ] HTTPS enabled
- [ ] No broken internal links (Screaming Frog or similar crawler)
- [ ] Canonical tags set correctly on all pages
- [ ] Image alt text descriptive and keyword-relevant
- [ ] Third-party scripts deferred (lazyOnload or defer attribute)

---

## Phase 4: AI Citation Check (15 min)

### Direct AI Testing

- [ ] Search your brand name in ChatGPT — does it mention you accurately?
- [ ] Search your brand name in Perplexity — does it cite your website?
- [ ] Search your top 3 service queries in ChatGPT — are you mentioned?
- [ ] Search your top 3 service queries in Perplexity — are you cited?
- [ ] Search your top 3 service queries in Google with AI Overviews — are you in the cited sources?
- [ ] Note any inaccuracies in AI responses about your business

### Fix AI Hallucinations

If AI engines are saying incorrect things about your business:
- [ ] Update your JSON-LD schemas with the correct information
- [ ] Ensure your Google Business Profile matches your website exactly
- [ ] Add explicit, structured content on your site correcting the misinformation
- [ ] Submit updated pages to Search Console for re-crawling
- [ ] Re-test in 2-4 weeks (AI engines re-index on different schedules)

---

## Scoring Your Audit

Count the checked boxes above:

| Score | Rating | Priority |
|-------|--------|----------|
| 0-15 | Critical | You are invisible to AI engines. Start with Phase 1 immediately. |
| 16-30 | Needs Work | Foundation exists but major gaps. Focus on Phases 2-3. |
| 31-45 | Good | Solid base. Optimize Phase 3 structured data and Phase 4 AI testing. |
| 46+ | Excellent | You are ahead of 95% of businesses. Maintain and iterate monthly. |

---

## Monthly Maintenance Cadence

| Week | Task |
|------|------|
| Week 1 | Re-run Search Console CTR analysis. Note new zero-click queries. |
| Week 2 | Send 5 guest post pitches. Update directory listings. |
| Week 3 | Validate all schemas. Test AI citations for top queries. |
| Week 4 | Review metrics. Update this checklist with new findings. |

---

*Part of the GEO Authority Stack. See also: [Guest Post Outreach Template](guest-post-outreach-template.md) | [Google Business Profile Schema](google-business-profile-schema.json) | [Search Console AI Tracker](google-search-console-ai-overview-tracker.py)*
