# Jihan Lee · Portfolio

A hand-built, multi-page portfolio. No frameworks, no build step: open `index.html` in a browser and it works.

## Pages

| Page | File |
| --- | --- |
| Home: intro, page directory, skills, now | `index.html` |
| Control room: live PLC conveyor simulator | `control.html` |
| Projects, with playable demos | `projects.html` |
| EPQ: hexapod robot research project | `epq.html` |
| Journey: school, work experience, timeline | `journey.html` |
| GitHub: real repo and contribution stats | `github.html` |
| Contact | `contact.html` |

The side rail, status island, command palette, terminal and theme studio are added to every page by `app.js`, so each page file only holds its own content.

## Other files

| File | What it is |
| --- | --- |
| `data.js` | **All the content**, including the EPQ section. Edit this one. |
| `github-snapshot.js` | Saved copy of real GitHub stats, used when GitHub can't be reached. |
| `update-github.js` | Refreshes the snapshot: `node update-github.js` |
| `factory.js` | Control room simulator |
| `demos.js` | Project demos |
| `epq.js` | EPQ page: gate timeline, gait animation, interactive leg, energy maths |
| `app.js` / `styles.css` | Shared frame, rendering and styles |

## Keeping it honest

- **EPQ:** the content comes from the Obsidian vault and contains plans only. When trials happen, add the results to `data.js` (the Results section currently says "No trials yet").
- **Projects marked IDEA** in `data.js` are not on GitHub yet. Build them, or delete them.
- **GitHub stats** load live. Run `node update-github.js` now and then to refresh the backup.

## Shortcuts

`Ctrl K` command palette · `` ` `` terminal (try `pages`, `epq`, `plc status`, `neofetch`) · `Alt 1`–`Alt 7` jump to a page · `/` search projects.
Project links: `projects.html#project-space-sim`.

## Put it online (free)

- **GitHub Pages:** upload this folder to a repo (for example the existing `Portfolio` repo), then Settings → Pages → deploy from `main`.
- **Netlify / Vercel / Cloudflare Pages:** drag this folder onto their dashboard.
