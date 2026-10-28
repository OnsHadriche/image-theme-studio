<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Menu data (categories, menu_articles) is read/written directly from the browser via the Supabase client; RLS (public read, `has_role(admin)` write) is the security boundary. Why: single source of truth for admin and public menu.
- Menu images live in the private `menu-images` bucket (public buckets are blocked in this workspace); store the object path in `image_url` and sign URLs at display time.
- The first account to sign up is auto-granted admin via a trigger; later accounts get no write rights.
