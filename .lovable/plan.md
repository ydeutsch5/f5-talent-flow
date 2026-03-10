

## Plan: Add Demo/Bypass Login Mode

Since there's no backend server running, you can't authenticate. I'll add a "Demo Mode" button on the login page that logs you in with a fake admin user, allowing you to explore all pages with mock-friendly empty states.

### Changes

1. **`src/pages/Login.tsx`** — Add a "View Demo" button below the sign-in form that calls `setUser()` with a hardcoded demo admin user (no API call) and navigates to `/dashboard`.

2. **`src/lib/api.ts`** — Wrap the `fetch` call so that when no backend is reachable (network error), it returns empty/mock responses instead of crashing. This way all pages render their empty states gracefully rather than showing errors.

3. **`src/stores/authStore.ts`** — Add a `isDemoMode` flag so the app knows it's running without a backend (optional, for future use).

This keeps the real login flow intact for when the backend is available, while letting you preview the full UI immediately.

