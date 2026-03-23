# MockTest App

## Current State
The app has a fully functional admin panel with a User Scores tab. The backend (main.mo) has `deleteUserScoreRecord` and `resetAllScores` functions, but they were never compiled into the candid declarations (`backend.did.js`, `backend.did.d.ts`, `backend.d.ts`). As a result, the actor does not expose these methods at runtime. The hooks call `(actor as any)` to work around type checking, but the methods don't actually exist on the actor, so delete and reset silently fail.

## Requested Changes (Diff)

### Add
- Regenerate backend to include `deleteUserScoreRecord(userId: Principal, timestamp: Time) -> async ()` and `resetAllScores() -> async ()` in the candid declarations so they are available on the actor.

### Modify
- Update hooks to call the properly-typed actor methods (removing `(actor as any)` casts).
- Ensure confirmation dialogs in AdminPanel use native `window.confirm` or the existing AlertDialog correctly — already implemented, just needs working backend.
- Fix `resetAllScores` backend logic: currently modifies the map while iterating, which may not clear all entries. Collect keys first, then remove.

### Remove
- Nothing removed.

## Implementation Plan
1. Regenerate Motoko backend including all existing functions plus `deleteUserScoreRecord` and `resetAllScores` so candid is updated.
2. Update `useDeleteUserScoreRecord` and `useResetAllScores` hooks to use typed actor calls.
3. Validate frontend build.
