# Feature Specification: Plumber Wars playable campaign
> **Superseded:** this spec describes the original prototype. The rebuilt game is documented in the root README.md.
Created: 2026-09-26 · Status: Accepted gameplay

## User Scenarios & Testing
### US1 — Pick a hero and reach a customer (P1)
Choose Dalton (driving), Milan (repair), or Jared (patience); the others become teammates. Race along diagonally viewed scrolling streets using touch or keyboard.
Acceptance: steering and braking work together. Cyclist collision, arrival timeout, or rival winning fails the household. Other hazards slow the van. Pets escape. Both rivals can drop cones. Teammate assistance recharges.

### US2 — Repair under pressure (P1)
Arrival shows family, problem illustration, and instructions before the timer. Each household has three quick repair steps. Customer mood advances to maximum rage: they kick the crew out and call Northwest.
Acceptance: incorrect actions never complete a step; timed actions require the correct window; pipe rotations must align; leaks require distinct targets. Retry preserves previous jobs. Success unlocks the next household.

### US3 — Win the Sound (P2)
Five districts, three jobs each, with increasing difficulty. District victories show a territory map and frustrated Northwest crew. Level five ends in a joyful celebration and market domination.
Acceptance: territory changes after three jobs; fifteen completions reach the finale; completed saves reopen the finale.

## Functional Requirements
- FR-001: Three heroes, two contextual teammate abilities, replaceable portraits.
- FR-002: Five levels, fifteen distinct problems and diverse named households.
- FR-003: Driving and repair perspectives, with four reusable minigame families.
- FR-004: Multi-touch, keyboard, pause, mute and portrait orientation guidance.
- FR-005: Current-household retry and validated local checkpoint; gracefully handle unavailable storage.
- FR-006: Welcome, guide, briefing, driving, repair, result, takeover and finale screens.
- FR-007: G’s Plumbing / COOL HOMIES branding and fictional Northwest.

## Edge Cases
Pause on backgrounding and clear input. Handle pointer cancellation. Corrupt save falls back safely. Double completion cannot skip jobs. Replay requires confirmation before deleting progress.

## Success Criteria
All 15 jobs are traversable; core progression/failure checks pass; production builds; touch-sized layout and real UI flow checked in browser. Physical-device tests remain a release gate.

## Assumptions
Single-player; no accounts or payments. Landscape recommended. Original placeholder portraits. Curated regional residential problems, not a statistical top-15 ranking. Arcade minigames are not real repair instructions.
