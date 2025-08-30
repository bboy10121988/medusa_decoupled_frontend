# Sanity Studio AbortError Console Noise

Context:

- In Sanity Studio (sanity v4) running inside Next.js (Turbopack, React 18/19),
  you may see repeated console errors like:

  "AbortError: signal is aborted without reason" with RxJS stack traces.

Cause:

- Studio uses streams (RxJS) and fetch with AbortSignal. When routes remount or
  hot reloads occur, requests are aborted by design. Some RxJS chains surface
  these as errors, spamming the console.

What we changed:

- We silence these specific AbortError logs on the Studio route only, without
  touching node_modules or impacting the rest of the app:

  - src/app/studio/page.tsx
    - Adds a scoped console.error filter and an `unhandledrejection` handler
      that ignores AbortError / "signal is aborted" messages.
    - Cleans up handlers on unmount.

Notes:

- This does not suppress real errors. Only messages that clearly match abort
  cancellations are filtered. If you want to disable this behavior, remove the
  effect block in `StudioPage`.

Alternative approaches (optional):

- Pin RxJS to a version where cancellation handling is quieter.
- Ask Sanity to suppress abort-related logs in Studio; track upstream issue.
- Avoid live/streaming features during development.
