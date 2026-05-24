# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Next.js Version

This is **Next.js 16.2.6** with breaking changes from older versions. Before writing any Next.js-specific code, consult the built-in docs at `node_modules/next/dist/docs/`. App Router only — no Pages Router.

## Commands

```bash
npm run dev      # Development server on port 3001
npm run build    # Production build
npm run lint     # ESLint (next/core-web-vitals + next/typescript)
npm start        # Production server
```

No test suite is configured.

## Architecture Overview

**MediaRate** — a movie/TV review and discovery site. Single Next.js App Router app consuming a REST API from group-3.

### Backend dependency

All data comes from **`https://group-project-backend-group-3-1.onrender.com`** (OpenAPI spec at `openapi.yaml`). Core endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /movies/popular`, `GET /shows/popular` | Browse listings |
| `GET /movies/details/:id`, `GET /shows/details/:id` | Detail pages (metadata + community) |
| `GET /movies?title=`, `GET /shows?title=` | Title search |
| `GET /community/discovery?type=&sort=` | Top-rated / most-reviewed |
| `GET /ratings/me`, `GET /reviews/me` | Auth-required user data |
| `GET /heartbeat` | Health check |

### Auth

**Auth.js v5** (`next-auth@beta`) with a custom OAuth2 provider ("TCSS IAM"):

- Identity provider: `https://tcss-460-iam.onrender.com`
- Config in `src/auth.ts` — exported `auth`, `handlers`, `signIn`, `signOut`
- Session stores `user.id`, `user.name`, `user.email`, `user.image`, and `accessToken`
- `AuthSessionProvider` wraps the layout in `src/components/auth-session-provider.tsx`

**Critical proxy.ts pattern**: `src/proxy.ts` must use `export default auth` directly (not re-export). Re-exports break the Next.js 16 proxy/middleware integration. The proxy protects all routes except `api`, static files, and favicon.

### Data flow

```
Raw API response (MovieResult / ShowResult / DiscoveryResult)
  → normalizeMovie / normalizeShow / normalizeDiscovery (src/lib/normalize.ts)
  → MediaItem (src/types/media.ts)
  → MediaCard / MediaGrid (components)
```

- **Browse pages** (`/movies`, `/tv`, home) fetch popular + discovery data, batch community stats via `getCommunityStats()`, then normalize everything to `MediaItem` and render via `MediaGrid`.
- **Search mode**: When `?title=` is present, uses `searchMovies()`/`searchShows()` and renders individual `MovieCard`/`ShowCard` from `result-cards.tsx` (different layout than browse cards).
- **Detail pages** (`/movies/[id]`, `/tv/[id]`): Fetch detail from API (includes metadata + community), render with `BlurredBackground`, poster, metadata grid, community stats, and reviews. Use `auth()` to check login state for action buttons.
- **Profile page** (`/profile`): Client component, uses `useSession()` + `getRatings()`/`getReviews()` with access token.

### Component conventions

- **Server Components by default** — only add `"use client"` when using hooks, state, or browser APIs.
- **MUI Material Icons require `"use client"`** — the Emotion runtime underlying MUI icons needs client-side rendering.
- **`next/image` works in server components** without `"use client"` — only needed for `onLoad`/`onError`/`loader` props.
- Tailwind v4 with `@import "tailwindcss"` (no tailwind.config). Dark theme via `prefers-color-scheme`.
- Styling: Tailwind utility classes throughout, with occasional CSS modules (`page.module.css`, `result-cards.module.css`) for search result cards.

### Key types (`src/types/`)

- `MediaItem` — canonical internal type (used by MediaCard/MediaGrid)
- `MovieResult` / `ShowResult` — raw API shapes for popular/search endpoints
- `DiscoveryResult` / `DiscoveryResponse` — community discovery endpoint shapes
- `RatingRecord` / `ReviewRecord` — user profile data

### File structure

```
src/
  auth.ts              # Auth.js v5 config
  proxy.ts             # Next.js middleware (export default auth)
  app/
    layout.tsx          # Root layout
    page.tsx            # Home page (popular movies + shows)
    movies/
      page.tsx          # Browse (popular/top-rated/most-reviewed) + search
      [id]/page.tsx     # Movie detail
    tv/
      page.tsx          # Browse + search
      [id]/page.tsx     # TV detail
    profile/page.tsx    # User profile (client)
    sign-in/page.tsx    # Sign-in page (client)
    api/auth/[...nextauth]/route.ts  # Auth.js route handler
  components/
    header.tsx           # Nav, search overlay, profile dropdown (client)
    MediaGrid.tsx        # Browse grid (server-compatible)
    MediaCard.tsx        # Browse card with poster, rating, review badges
    result-cards.tsx     # Search result cards (MovieCard, ShowCard) — different layout
    BlurredBackground.tsx
    MediaActionButtons.tsx
    CommunityStats.tsx / RecentReviews.tsx / SeasonsCarousel.tsx
    auth-session-provider.tsx  # SessionProvider wrapper (client)
  lib/
    api.ts              # All API calls + ApiError class
    normalize.ts        # Raw API → MediaItem transforms
```

## Environment variables

```
OAUTH_CLIENT_ID        # OAuth2 client ID (default: group-4-consumer)
OAUTH_CLIENT_SECRET    # OAuth2 client secret
NEXTAUTH_URL           # http://localhost:3001
NEXTAUTH_SECRET        # Auth.js encryption secret
```

## API client patterns

- `apiGet<T>(path)` — public GET with 1h revalidation, throws `ApiError` on non-2xx
- `searchMovies(title)` / `searchShows(title)` — search (returns empty array on error)
- `getCommunityStats(ids, type)` — batch fetch averageRating + reviewCount for a list of TMDB IDs
- `getRatings(token)` / `getReviews(token)` — auth-required, used in profile page
- `ApiError` class has `status`, `statusText`, `body` — use `instanceof ApiError` for error branching
- Detail page JSON uses **camelCase** (`averageRating`, `reviewCount`, `recentReviews`) but some fields may arrive in snake_case — `RecentReviews` component handles both.
