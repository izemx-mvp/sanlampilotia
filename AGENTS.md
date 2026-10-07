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

## Architecture
- All data is front-end mock data in `src/lib/data.ts`, held in a React context store (`src/lib/store.tsx`); no backend. Why: MVP brief requires front-end-only interactions.
- "AI agent" follow-ups are derived by pure rules in `src/lib/actions.ts` (`buildActions`), never stored. Why: one source of truth for dashboard, agent pages and analytics.
- Shared UI primitives live in `src/components/app/ui.tsx`; modals/forms in `src/components/app/dialogs.tsx`. Why: keep route files thin.
