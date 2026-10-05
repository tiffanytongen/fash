# Product

## Current MVP: manual concierge curation

> **Core validation question:** *Will users value receiving a curated shortlist of Taobao items based on their inspiration?*

Before automating anything, we test whether people want the outcome at all. A shopper sends **one inspiration image** plus a few preferences. **A person** (the founder) searches Taobao by hand and sends back **3–5 picks**. Each pick explains why it matches and adds notes on the shop, reviews and sizing.

Nothing in the live flow claims AI or automatic matching. The request page says the picks are hand-curated.

**What the shopper gives us:** inspiration image · what they like about it (optional) · budget per item (MYR/AUD) · usual size · measurements (optional) · preferred fit · "Find this" (close match) or "Find my vibe" (similar style) · extra notes (optional).

**What they get back:** a request page (`/requests/<id>`) that shows "pending" until picks are added, then the shortlist.

**Signals to watch:** do people submit requests? Do they come back to the page? Do they click through to Taobao? Do they buy? Would they pay or request again?

## Long-term direction: a personalised inspiration-to-Taobao discovery engine

User gives inspiration → system understands the look → searches and ranks Taobao items → filters for reliable shops and good reviews → personalises over time → helps with sizing and fit.

### Future layers (built only once the concierge proves demand)
1. **Curated shop database:** reliable shops we've vetted, with quality notes.
2. **Automated retrieval:** image analysis and Taobao search that suggest candidates (first to the curator, later to users).
3. **Personalisation:** learn each shopper's taste from what they save, click and buy.
4. **Swipe taste onboarding:** a quick like/skip flow to bootstrap taste.
5. **Sizing / fit assistant:** compare size charts with the shopper's measurements.

## Vision

Make Chinese fashion — especially Taobao — easy to discover and buy for English-speaking shoppers, starting in Malaysia and Australia.

## Target users

Young, style-conscious shoppers who find inspiration on Pinterest, Instagram or Xiaohongshu and want similar pieces from Chinese brands and sellers.

## The problem

1. **Language.** Taobao and Xiaohongshu are mostly in Chinese. Searching needs the right Chinese keywords.
2. **Discovery.** There are millions of listings. It's hard to know which sellers are good.
3. **Sizing.** Chinese sizes often run smaller and vary by seller.
4. **Buying.** Shipping, agents and payment are confusing for first-time buyers.

## Also in the prototype (supporting, not the focus)

- Discover page with a fictional demo catalogue and text search
- Product detail pages and saved items
- `/labs/auto-match`: the experimental automated matcher (mocked analysis), kept for later

**Out of scope for now:** checkout, payments, accounts, a real database, AI APIs, Taobao scraping.

## Assumptions to validate with real users

These are guesses. Each one should be tested in conversations or simple experiments before we build much more.

| # | Assumption | How to test cheaply |
| --- | --- | --- |
| 0 | **People want a curated Taobao shortlist from their inspiration** (the core question). | Run the concierge with 10–20 real people: measure requests, return visits, Taobao clicks and purchases. |
| 1 | Shoppers' main barrier is **finding** items, not trusting or paying for them. | Ask 10 target users to describe their last attempt to buy from Taobao — where did they give up? |
| 2 | People would rather **describe a style in words** or **upload a screenshot** than browse categories. | Watch 5 people use the prototype; note which entry point they choose first. |
| 3 | **Curation** (fewer, trusted items) beats a huge catalogue. | Show a 16-item edit vs. a long list; ask which feels more useful. |
| 4 | **Sizing guidance** meaningfully increases willingness to buy. | Ask: "Would a sizing tip change whether you'd order this?" |
| 5 | The aesthetic labels (New Chinese, Coquette, Quiet luxury…) match how users actually talk. | Ask users to name the style of their own Pinterest boards. |
| 6 | Users will click through to Taobao (or an agent) to buy, rather than expecting checkout here. | Track clicks on "View original listing" once real links exist. |
| 7 | Malaysia and Australia have similar needs. | Interview users in both; compare pain points (shipping, sizing, price sensitivity). |
