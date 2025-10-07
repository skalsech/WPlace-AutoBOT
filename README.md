<div style="display: flex; align-items: center;">
  <img width="200" style="margin-right: 20px;" src="https://github.com/user-attachments/assets/c14ef2b5-e104-4526-9b17-23cb2abc9efe" alt="WPlace UserScript">
  <div style="text-align: center;">
    <p><strong>WPlace UserScript</strong></p>
    <p>This is a Tampermonkey-based fork of <a href="https://github.com/Wplace-AutoBot/WPlace-AutoBOT">WPlace-AutoBOT</a>, optimized for safety and developer experience.</p>
    <p><a href="https://discord.gg/knkNRYyQcm">Join community Discord</a> • <a href="https://wplace.live">wplace.live</a></p>
  </div>
</div>

> ⚠️ **Warning**: This is an educational script. Use at your own risk — WPlace may ban accounts for automation.

> ⚙️ **Note:** Documentation and developer workflow setup are still in progress.
> The README will be expanded and clarified as the development environment and tooling are finalized.

## 🧩 Key Features & Differences
- **Focused single-feature build**: This fork keeps only the **"Auto-Image"** — the rest (`Acc-Switch.js`, `Art-Extractor.js`, `Auto-Farm.js`, `Auto-Repair.js`) currently contain excessive boilerplate and overlapping logic at the moment. These features may be reimplemented later in a cleaner, modular form if necessary.
- **Live development server**: Run `npm run dev` → changes to `src/js/` and `src/css/` auto-rebuild, and then you need 2 clicks to inject new version into WPlace.
- **No fake or rotating fingerprints**: Use real browser's fingerprint for maximum safety and realism.
- **Only manual account switching**: Use separate browser installations (e.g., Chrome for Account 1, Firefox for Account 2) — no automation, no detection risk. (later can be updated to multi accounts but still with real and fixed fingerprints)
- **Tampermonkey-only**: Works in any browser with Tampermonkey/Violentmonkey
- **No extension installation**: Just install via one click — [direct link to latest build](https://github.com/skalsech/WPlace-AutoBOT/raw/custom-main/dist/script.user.js) (requires Tampermonkey/Violentmonkey).
- **Auto-updates enabled**: Script checks for updates automatically via `@updateURL` — just click "Update" in Tampermonkey when a new version is released.
- **Built with esbuild**: Clean, minified, and fast — `dist/script.user.js` is generated from `src/` with full metadata injection (version, build time, etc.).
- **Modular and cleaned-up codebase**: Refactored into a modular structure and cleaned from legacy, unused, and AI-generated clutter (some small traces may still remain).
---

## 📦 Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) in your browser.
2. Open the [latest script build](https://github.com/skalsech/WPlace-AutoBOT/raw/custom-main/dist/script.user.js) and click **Install**.
3. Visit [wplace.live](https://wplace.live) — the script will autoload.

> **Pro tip**: Bookmark the [installation link](https://github.com/skalsech/WPlace-AutoBOT/raw/custom-main/dist/script.user.js)  — manual update is always the fastest way.
> 
> Tampermonkey checks for updates every 6–24 hours (you’ll be asked to confirm before updating). Other extensions like Violentmonkey may have similar delays. 
---

## 💻 Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/skalsech/WPlace-AutoBOT
   cd WPlace-AutoBOT
   ```

2. Switch to the `custom-main` branch:
   ```bash
   git checkout custom-main
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the live development server:
   ```bash
   npm run dev
   ```

> ⚙️ **Note:** Documentation and developer workflow setup are still in progress.
> The README will be expanded and clarified as the development environment and tooling are finalized.

