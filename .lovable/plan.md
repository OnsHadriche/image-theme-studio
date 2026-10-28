# Admin Dashboard — Monaco Club Gammarth

## What exists today
- Empty starter app, no public menu, no database, no login, no image storage.
- Theme already applied from the "Bleu." reference: brand blue, warm cream, Satoshi font, rounded soft cards.

## What will be built
1. **Lovable Cloud** turned on for database, login and image storage.
2. **Admin sign-in** (email + password). Only accounts with the admin role can change menu content — enforced in the database, not just the screen.
3. **Dashboard home**: real counts (categories, articles, articles without photo, last update), quick actions, links to QR page and public menu.
4. **Categories**: list, search, create, edit, reorder (up/down), delete. Deleting a category with articles is blocked until they are moved or removed.
5. **Articles**: list with photo, category, price (DT); search, filter by category, create/edit form with photo upload + preview, reorder, delete with confirmation.
6. **QR Code page**: QR pointing to the fixed address `/menu/monaco-club-gammarth`; download PNG and SVG, print layout with restaurant name, copy link, open link.
7. **Minimal read-only public page** at that address showing saved categories and articles, so the QR code works (no admin buttons).
8. Mobile: sidebar becomes a slide-out menu.

## Technical details
- Tables: `categories`, `menu_articles` (FK restrict on delete), `user_roles` + `has_role()`; public read, admin-only write via RLS; `updated_at` triggers.
- Storage bucket `menu-images` (public read, admin write), 5MB image limit, jpg/png/webp.
- Routes: `/auth`, `/_authenticated/admin/*` (dashboard, categories, articles, qr), `/menu/$slug`.
- QR via `qrcode` library; first signed-up admin role assigned manually via SQL after you create your account.
