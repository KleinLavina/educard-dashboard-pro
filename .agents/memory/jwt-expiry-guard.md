---
name: JWT expiry check in auth guard
description: Auth guard must decode the JWT and check exp, not just check token presence
---

The `beforeLoad` auth guard in `__root.tsx` originally only checked `!!localStorage.getItem('educard_access')`. This allowed expired tokens to pass as authenticated.

**Rule:** Always decode the JWT payload and compare `payload.exp * 1000 > Date.now()` before treating a token as valid. Invalid base64url must be caught with try/catch.

**Why:** JWT expiry is the primary security mechanism. A present-but-expired token should redirect to /login just like a missing token.

**How to apply:** Use the `hasValidToken()` helper (in `__root.tsx`) pattern — split on `.`, atob the second segment with `-/+` and `_//` substitution, parse JSON, check `exp`. Role-context also applies the same check when reading the initial role from localStorage.
