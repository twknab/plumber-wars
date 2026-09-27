# Implementation Plan
Date: 2026-09-26 · Specification: [spec.md](spec.md)

## Summary
Phaser 3.90 renders the diagonal street race. HTML overlays handle crisp responsive menus, controls and repair minigames. Original local SVG artwork shares cream, green, coral and sunshine colors.

## Technical Context
JavaScript, Node 22, Vite; versioned local save with validation. Node tests for progression, collisions and repair correctness; browser checks for rendered flows. Mobile landscape and desktop web target. 60 fps goal; no runtime external assets. Steam/native packaging deferred.

## Constitution Check
Touch controls, pause, safe pets, cheerful style, complete 15-household progression and honest platform scope are gates. No backend needed.

## Project Structure
src/content.js — heroes, levels and jobs.
src/model.js — progression, rules and save validation.
src/art.js — SVG portraits, vehicles, fixtures and Seattle illustrations.
src/driving.js — Phaser race.
src/main.js — UI flow, minigames, audio, persistence.
src/style.css — responsive styling.
tests/model.test.js — meaningful rule checks.

## Release Boundary
Local playable prototype. Later work: real likenesses, additional polish/music, physical-device testing, controller support, Steam/native packaging.
