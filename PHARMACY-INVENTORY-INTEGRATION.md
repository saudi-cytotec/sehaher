# Pharmacy inventory feed — SehaHer

This feed is the single market-separated source for public price and stock snippets on the six country pages.

## Current state
The six markets are configured, but product arrays are intentionally empty. No price, stock status, branch or registration approval has been fabricated. The country pages therefore show a truthful "no current publishable data" state until the pharmacy's real source is connected.

## Required record per product
- `product_name`, optional `strength`
- `price` as a number and `currency` matching the market currency
- `availability`: `in_stock`, `out_of_stock`, or `check_with_pharmacy`
- `updated_at`: ISO 8601 timestamp with timezone
- `branch_name` (only a real branch)
- `registration_verified: true` only after local product registration is checked
- `public_listing_approved: true` only after public advertising/display is cleared for that exact product and market
- optional `prescription_note`

## Markets and currencies
- SA / Saudi Arabia: SAR
- AE / UAE: AED
- KW / Kuwait: KWD
- BH / Bahrain: BHD
- QA / Qatar: QAR
- OM / Oman: OMR

## Display safeguards
The frontend displays only records with both verification flags set to true and a valid timestamp no older than 24 hours. It never converts currencies or copies a market's record into another market. Prices must match the market currency. Expired or incomplete records are hidden automatically.

## Connect the real source
The current website is static HTML. To automate live stock, connect the pharmacy POS/ERP or an approved spreadsheet/API to generate this JSON file on a schedule or webhook. Do not put API credentials in browser JavaScript or in this public repository. Use a server-side job or protected integration to export only approved public fields.

A spreadsheet/CSV import should use these columns:
`market_code,product_name,strength,price,currency,availability,updated_at,branch_name,registration_verified,public_listing_approved,prescription_note`

## Operational requirements
1. Confirm the source of truth (POS/ERP, inventory platform, or controlled spreadsheet).
2. Map each branch to one market only.
3. Have a responsible pharmacist/regulatory reviewer approve each product-market record.
4. Update the feed at least hourly if claiming near-real-time stock; otherwise describe it as a timestamped latest check.
5. Keep audit logs for price and stock updates.
6. Never expose internal stock quantities unless the pharmacy expressly wants them public and the display is approved.
