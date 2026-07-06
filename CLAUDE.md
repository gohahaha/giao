# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**米奇giaogiao屋** (Mickey Giaogiao House) is a private, cozy memory space for a 10-person friend group. It's a static single-page application that replaces scattered WeChat records with a permanent, organized archive of daily life, photos, and memories.

## Architecture

This is a **pure frontend application** with no backend, no database, no build tools, and no framework dependencies.

### Tech Stack
- HTML5, CSS3, Vanilla JavaScript
- localStorage for all data persistence
- GitHub Pages for hosting

### Key Design Decisions
- **No build system**: Files are served directly as-is
- **No npm/node**: Zero dependencies
- **localStorage only**: Each browser stores its own data independently
- **Mobile-first**: Designed primarily for phone usage

## Data Architecture

All user data is stored in browser localStorage under these keys:
- `house_feed` - Social feed posts (array of post objects)
- `house_album` - Photo album entries (array of photo objects)
- `house_board` - Message board entries (array of message objects)

Each data object has: `id`, `authorId`, `time` (timestamp), plus type-specific fields.

Members are hardcoded in `js/data.js` as the `MEMBERS` array (10 members, each with id, name, emoji, title, desc, joinDate, motto).

## File Structure

```
index.html          - Single-page app entry point, all sections
css/
  style.css         - Main styles, CSS variables, responsive design
  animations.css    - Animation keyframes and utility classes
js/
  data.js           - DataStore class, MEMBERS config, localStorage operations
  app.js            - Core app logic, navigation, UI helpers
  feed.js           - Social feed functionality
  album.js          - Photo album functionality
  members.js        - Member profiles
  timeline.js       - Timeline/memory view
  board.js          - Message board functionality
```

## Common Tasks

**Run locally**: Open `index.html` in browser (no server needed)

**Deploy**: Push to GitHub, enable Pages in repo Settings → Pages → Deploy from main branch

**Add/modify members**: Edit `MEMBERS` array in `js/data.js`

**Change theme colors**: Edit CSS variables in `:root` block in `css/style.css`

## Code Patterns

- All sections are in `index.html`, shown/hidden via `showSection(id)`
- Data operations go through the `dataStore` global instance (DataStore class)
- UI updates call specific load functions: `loadFeed()`, `loadAlbum()`, `loadBoard()`, etc.
- Modals are used for forms (post, upload, comment, member detail)
- Member identification uses `authorId` matching against `MEMBERS` array
