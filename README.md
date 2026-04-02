# Grimoire Recap

A mobile-first web app for Blood on the Clocktower storytellers to track what happens during a game, so you can actually explain it to the players at the end.

## What it does

As the storyteller you have the grimoire to run the game, but by the end it's hard to remember every piece of information you gave out. This app lets you record it as you go:

- **Setup** — Add players and assign roles (Trouble Brewing edition)
- **Night phases** — Track what you told each player: who the Fortune Teller asked about, what number the Empath got, who the Poisoner targeted, etc. Role-specific input fields keep it fast.
- **Day phases** — Record deaths, nominations, and execution outcomes
- **Status tracking** — Mark players as poisoned, drunk, or dead. Status is phase-aware so you can look back and see who was alive at any point.
- **Freeform notes** — Add notes per phase for key moments, bluffs, accusations
- **Game summary** — One-tap recap that compiles everything chronologically

## Usage

Open https://sash-a.github.io/grimoire-recap/ on your phone. Add to home screen for a full-screen app experience that works offline.

## Tech

Svelte 5, Vite, PWA with service worker. No backend — everything stays in your browser's session storage. Closing the tab clears the game.

## Development

```bash
npm install
npm run dev
npm test
```
