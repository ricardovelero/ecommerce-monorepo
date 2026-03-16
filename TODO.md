# TODO

Updated on 2026-03-16.

## Recently completed: order fulfillment emails

### Goal

Send an email to the customer when an admin updates the order fulfillment status, including tracking number and tracking link when they are added.

### Completed

- Trigger rules implemented:
  - send email when fulfillment status changes
  - send email when tracking number or tracking URL is newly added or changed
  - avoid duplicate emails when admin saves without meaningful changes
- Dedicated backend fulfillment email service/template added
- Fulfillment email sending wired into the admin order update flow
- Email includes:
  - order id
  - current fulfillment status
  - tracking number when present
  - tracking URL when present
- Current fallback behavior when `User.email` is missing:
  - skip send and log the reason
- Sent/skipped fulfillment email logging added
- Tests added for:
  - status change sends email
  - tracking info added sends email
  - no-op update does not send email
  - missing email/Postmark config is handled safely

## Recently completed: Merchandising

### Completed

- Homepage merchandising blocks defined around:
  - featured products
  - best sellers
  - new arrivals
- Backend merchandising endpoint added for homepage sections
- Product merchandising fields added:
  - `isFeatured`
  - `featuredRank`
- Admin product controls added for merchandising visibility and order
- Homepage updated to render live merchandising sections from backend data
- Seed data updated so local environments have featured products ready
- Tests added for:
  - homepage merchandising ordering/derivation
  - admin featured-rank normalization behavior
  - featured-rank validation rules

## Next priority: SEO

- Add per-page title and meta description
- Add product/category SEO fields
- Add canonical URLs, sitemap, and robots.txt
- Review structured data for product pages

## Later roadmap

### Reviews

- Design review data model and moderation rules
- Add customer review submission flow
- Show rating summary and reviews on product pages
- Decide whether only verified buyers can review

### Wishlist

- Add wishlist data model and API
- Add save/remove wishlist actions in storefront
- Add wishlist page for signed-in users

### Analytics

- Decide scope: internal dashboard only vs third-party tracking
- Add storefront event tracking for product view, add to cart, checkout start, purchase
- Expand admin analytics with merchandising/revenue conversion views
