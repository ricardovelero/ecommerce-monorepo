# TODO

Paused on 2026-03-13.

## Next priority: order fulfillment emails

### Goal

Send an email to the customer when an admin updates the order fulfillment status, including tracking number and tracking link when they are added.

### Current code to start from

- Backend fulfillment update: `apps/backend/src/services/orderService.ts`
- Admin fulfillment endpoint/controller: `apps/backend/src/controllers/adminOrderController.ts`
- Admin fulfillment validation: `apps/backend/src/validators/adminOrderValidators.ts`
- Existing order email service: `apps/worker/src/services/emailService.ts`
- Admin order detail UI: `apps/frontend/src/features/admin/AdminOrderDetailPage.tsx`

### TODO

- Decide the trigger rules:
  - send email when fulfillment status changes
  - send email when tracking number or tracking URL is newly added or changed
  - avoid duplicate emails when admin saves without meaningful changes
- Add a dedicated email template/service for fulfillment updates
- Wire fulfillment email sending into the admin order update flow
- Include in the email:
  - order id
  - current fulfillment status
  - tracking number when present
  - tracking URL when present
- Confirm which customer email should be used when `User.email` is missing
- Add logging for sent/skipped fulfillment emails
- Add tests for:
  - status change sends email
  - tracking info added sends email
  - no-op update does not send email
  - missing email/Postmark config is handled safely

## Later roadmap

### Merchandising

- Define homepage merchandising blocks
- Add featured products / collections / best sellers
- Add admin controls for merchandising order and visibility

### SEO

- Add per-page title and meta description
- Add product/category SEO fields
- Add canonical URLs, sitemap, and robots.txt
- Review structured data for product pages

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
