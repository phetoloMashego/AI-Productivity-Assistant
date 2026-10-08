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

## MoyaAssist SA architecture
- AI calls live in `src/lib/ai.functions.ts` (server functions, streamed Responses API) and fall back to `src/lib/ai-mock.ts` on any failure — so the demo always works without the AI service.
- Reports are stored in browser localStorage (`src/lib/reports-store.ts`) — prototype with no accounts; move to a database if login is added.
- App pages live under the pathless `_shell` layout (sidebar/header); the landing page `/` is outside it.
- Services, municipal contacts and stats are fictional demo data in `src/lib/data.ts` and must stay labelled as demo.
