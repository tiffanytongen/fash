# Product

## Vision

Make Chinese fashion — especially Taobao — easy to discover and buy for English-speaking shoppers, starting in Malaysia and Australia.

## Target users

Young, style-conscious shoppers who find inspiration on Pinterest, Instagram or Xiaohongshu and want similar pieces from Chinese brands and sellers.

## The problem

1. **Language.** Taobao and Xiaohongshu are mostly in Chinese. Searching needs the right Chinese keywords.
2. **Discovery.** There are millions of listings. It's hard to know which sellers are good.
3. **Sizing.** Chinese sizes often run smaller and vary by seller.
4. **Buying.** Shipping, agents and payment are confusing for first-time buyers.

## MVP (current prototype)

A mobile-first discovery prototype to test whether the *experience* resonates — before investing in real data or AI.

1. Landing page explaining the product
2. Discover page with curated (demo) items
3. Describe-your-style text search
4. Pinterest-style inspiration board with local image previews
5. Product details: images, English description, price, sizes, original-listing link (when available)
6. Saved items in `localStorage`
7. Responsive navigation (bottom tab bar on mobile)

**Out of scope for the MVP:** checkout, payments, accounts, scraping, real visual AI search, real listings.

## Assumptions to validate with real users

These are guesses. Each one should be tested in conversations or simple experiments before we build much more.

| # | Assumption | How to test cheaply |
| --- | --- | --- |
| 1 | Shoppers' main barrier is **finding** items, not trusting or paying for them. | Ask 10 target users to describe their last attempt to buy from Taobao — where did they give up? |
| 2 | People would rather **describe a style in words** or **upload a screenshot** than browse categories. | Watch 5 people use the prototype; note which entry point they choose first. |
| 3 | **Curation** (fewer, trusted items) beats a huge catalogue. | Show a 16-item edit vs. a long list; ask which feels more useful. |
| 4 | **Sizing guidance** meaningfully increases willingness to buy. | Ask: "Would a sizing tip change whether you'd order this?" |
| 5 | The aesthetic labels (New Chinese, Coquette, Quiet luxury…) match how users actually talk. | Ask users to name the style of their own Pinterest boards. |
| 6 | Users will click through to Taobao (or an agent) to buy, rather than expecting checkout here. | Track clicks on "View original listing" once real links exist. |
| 7 | Malaysia and Australia have similar needs. | Interview users in both; compare pain points (shipping, sizing, price sensitivity). |
