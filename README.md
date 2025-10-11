<div style="display: flex; align-items: center;">
  <img width="200" style="margin-right: 20px;" src="https://github.com/user-attachments/assets/c14ef2b5-e104-4526-9b17-23cb2abc9efe" alt="WPlace UserScript">
  <div style="text-align: center;">
    <p><strong>WPlace UserScript</strong></p>
    <p>This is a Tampermonkey-based fork of <a href="https://github.com/Wplace-AutoBot/WPlace-AutoBOT">WPlace-AutoBOT</a>, rebuilt for <strong>safety, modularity, and developer experience</strong>.</p>
    <p><a href="https://discord.gg/knkNRYyQcm">Join community Discord</a> • <a href="https://wplace.live">wplace.live</a></p>
  </div>
</div>

> ⚠️ **Warning:** This is an **educational** and **non-commercial** script.  
> Use at your own risk — WPlace may ban accounts for automation.

---

## 🧩 Key Features & Differences

- **Focused core module:** Retains only the **Auto-Image** subsystem.  
  Legacy scripts (`Acc-Switch.js`, `Art-Extractor.js`, `Auto-Farm.js`, `Auto-Repair.js`) are removed for now and will be reintroduced modularly later.
- **Refactored architecture (in progress):** The codebase is gradually being transitioned to a modular structure (`core/`, `ui/`, `storage/`, `security/`, `handlers/`, `tiles/`). Some legacy non-reactive code still exist and will be cleaned up over time.
- **IndexedDB persistence:** Progress data (with cached overlay and some metadata) is stored with async migrations and safe validation.
- **Evolving state management:** Introduced a centralized `state.update()` system with an event emitter, but not all components are reactive yet.  
  Many legacy modules still update state directly; refactoring toward a fully event-driven model is ongoing.
- **Color frequency analysis:** Real-time color frequency computation and auto-sorted rendering in UI.
- **Secure fingerprinting:** Uses **real browser fingerprint** (via FingerprintJS) — no random or rotating fingerprints.
- **Integrity protection:** WebAssembly-based token + Pawtect validation to prevent unauthorized execution.
- **UI components:** Includes new draggable dialogs and coordinate generation modes, filters.  
  The **resize-dialog** component functions, but hasn’t been thoroughly tested (I don't understand purpose of this functionality inside bot, when I just use a separate converter for images).
- **Internationalization (i18n):** Modular dynamic localization via `IntlMessageFormat` and `data-i18n-key`.
- **Live development mode:** `npm run dev` — esbuild rebuilds JS/CSS and you can see changes to project instantly on site.
- **No extensions required:** Single-click installation through Tampermonkey or Violentmonkey.
- **Automatic updates:** `@updateURL` integration and version injection will be added soon.
- **Built with esbuild:** Minimal, performant, and fully metadata-injected builds.

---

## 🧠 Architecture Overview

The application follows a **modular, event-driven architecture** to enforce separation of concerns, simplify testing, and enable predictable state management.  
Core logic, UI components, storage, and security are isolated into dedicated layers that communicate primarily through events.

Below is the high-level structure of the source code:


```
src/                         # Main source code of the project
├── css/                     # Styles and themes
│   ├── main.css              # Base global styles
│   └── themes/               # Set of theme variants
│       ├── classic-light.css
│       ├── classic.css
│       └── neon-retro.css
├── i18n/                     # Localization JSON files
│   ├── en.json
│   ├── es-MX.json
│   ├── fr.json
│   └── ... (other languages)
├── js/                       # Frontend logic
│   ├── config/               # Configurations and constants
│   │   ├── APP_CONSTANTS.js
│   │   ├── AUTO_GENERATED_LANGUAGES.js
│   │   └── DEFAULT_SETTINGS.js
│   ├── core/                 # Core business logic
│   │   ├── state.js          # Central state store + event system
│   │   ├── api-service.js    # API interactions
│   │   ├── auto-save.js      # Automatic progress saving
│   │   ├── captcha-handler.js
│   │   ├── coordinate-generator.js
│   │   ├── fetch-interceptor.js
│   │   ├── image-processor.js
│   │   ├── notification-manager.js
│   │   ├── painting-controller.js
│   │   ├── pixel-batch.js
│   │   ├── pixel-tracker.js
│   │   ├── selection-controller.js
│   │   └── wplace-ui.js
│   ├── i18n/                 # Localization logic
│   │   ├── fallback.js
│   │   └── i18.js
│   ├── lib/                  # Utilities and helper modules
│   │   ├── fingerprint.js    # Browser fingerprint detection
│   │   ├── inject-library.js
│   │   ├── intl-messageformat.js
│   │   └── load-all.js
│   ├── main.js               # Main frontend entry point
│   ├── security/             # Security and token management
│   │   ├── turnstile-manager.js
│   │   ├── turnstile.js
│   │   └── wasm-token.js
│   ├── startup/              # Application initialization logic
│   │   └── startup.js
│   ├── storage/              # Local storage and migration management
│   │   ├── indexed-db-storage.js
│   │   ├── migrations.js
│   │   ├── progress-manager.js
│   │   ├── settings-manager.js
│   │   └── storage.js
│   ├── tiles/                # Tile and overlay handling logic
│   │   ├── overlay-manager.js
│   │   └── tile-loader.js
│   ├── ui/                   # All UI-related logic
│   │   ├── alerts.js
│   │   ├── components/       # UI components
│   │   │   ├── create-color-filter-dialog.js
│   │   │   ├── create-panel.js
│   │   │   ├── create-resize.js
│   │   │   ├── create-settings.js
│   │   │   ├── create-start-position-dialog.js
│   │   │   ├── create-stats.js
│   │   │   └── resize/       # Resize-related components
│   │   │       ├── color-palette.js
│   │   │       ├── resize-dialog.js
│   │   │       ├── resize-dither.js
│   │   │       ├── resize-mask-events.js
│   │   │       ├── resize-mask-overlay.js
│   │   │       ├── resize-panzoom-controller.js
│   │   │       ├── resize-preview-controller.js
│   │   │       └── resize-size-handlers.js
│   │   ├── dialogs/          # Dialogs
│   │   │   └── StartPositionDialog.js
│   │   ├── handlers/         # Event handlers
│   │   │   ├── checkbox-handlers.js
│   │   │   ├── handle-color-filter.js
│   │   │   ├── main-panel/   # Main panel logic
│   │   │   │   ├── handle-data-buttons.js
│   │   │   │   ├── handle-header-buttons.js
│   │   │   │   ├── main-panel-handler.js
│   │   │   │   └── upload-handler.js
│   │   │   └── settings/     # Settings handlers
│   │   │       ├── coordinate-handler.js
│   │   │       ├── coordinate-ui.js
│   │   │       ├── notification-handler.js
│   │   │       └── settings-handler.js
│   │   ├── listeners/        # UI event listeners
│   │   │   ├── main-panel.js
│   │   │   ├── settings.js
│   │   │   ├── start-position-dialog.js
│   │   │   └── stats.js
│   │   ├── panel.js
│   │   ├── sync-ui.js
│   │   ├── theme.js
│   │   └── utils/
│   │       ├── dialog-utils.js
│   │       └── dom.js
│   └── utils/                # General utilities
│       ├── color-matching.js
│       ├── data-packing.js
│       ├── dev-utils.js
│       ├── files.js
│       ├── flags.js
│       ├── helpers.js
│       ├── math-utils.js
│       ├── painting-helpers.js
│       ├── StateEventEmitter.js
│       └── time.js
├── meta.js                   # Project tampermonkey-userscript metadata
├── stylelint.config.js       # Stylelint configuration
├── tests/                    # Unit and integration tests
│   ├── helpers.js
│   ├── settings-manager.test.js
│   ├── setup.js
│   └── sync-settings-ui.test.js
└── vitest.config.mjs         # Vitest configuration
````


> 💡 **Note on architectural maturity**  
> The **file structure already reflects the target modular layout**, but the **internal implementation is still evolving**. While logic has been moved into appropriate directories, some parts continue to rely on global state or cross-layer direct calls that bypass the intended event-driven boundaries.
>
> In other words: the *scaffolding is in place*, but the *code inside doesn’t always respect layer isolation yet*. I'm actively working to eliminate these anti-patterns and fully embrace the modular contract. Contributions that replace global access with proper layer interfaces or event-based communication are highly encouraged!

---

## 🔐 Security & Integrity

Security mechanisms implemented in this fork:

- ✅ **Real fingerprinting:** No spoofing or randomized identities.
- ✅ **WebAssembly token:** Ensures that only trusted builds can run.
- ✅ **Pawtect validation:** Prevents modified or injected runtime scripts.
- ✅ **CSP-safe injection:** Uses blob URLs for secure script mounting.
- ✅ **Controlled API access:** Built-in TTL caching for `/me` endpoint to reduce detection risk.

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

> Build output is located at `dist/script.user.js`.
> The build system injects metadata (version, build time, branch, hash) automatically.

---

## 🧪 Development Notes

* Uses **esbuild** for fast incremental builds.
* Includes **Vitest** + `happy-dom` for lightweight unit testing.
* ESLint globals and build constants are configured automatically.
* `@updateURL` points to the `custom-main` branch.
* You can safely modify only files under `src/`; all build-time constants are generated automatically.

---

## 🚨 Breaking Changes (vs original AutoBOT)

| Area             | Change                                                                                                       |
|------------------|--------------------------------------------------------------------------------------------------------------|
| State management | Replaced global variables with centralized event-based store                                                 |
| Progress storage | Switched from `localStorage` → `IndexedDB` with migrations                                                   |
| i18n             | Introduced dynamic localization system (language change on the fly, easier/cleaner addition of new languages |
| Fingerprint      | Real fingerprint (FingerprintJS) instead of fake UUID                                                        |
| Security         | Backend now validated against known anti-abuse protections (“Koala”, “Disabled”). Script halts if protections are missing or altered                                                                          |
| Build system     | Full esbuild refactor, no webpack                                                                            |
| UI               | New modular dialogs, draggable/resizable layout                                                              |
| Structure        | Complete reorganization into `core/`, `ui/`, `security/`, `storage/`, `handlers/`                            |

---

## 📦 Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Open the latest script build:
   👉 [**Install WPlace UserScript**](https://github.com/skalsech/WPlace-AutoBOT/raw/custom-main/dist/script.user.js)
3. Click **Install** and then open [wplace.live](https://wplace.live).

> 💡 **Tip:** Bookmark the installation link — it’s the fastest way to manually update.
> Tampermonkey checks for updates every 6–24 hours.

---

## 🧭 Roadmap

* [ ] Modular reintroduction of Auto-Farm / Art-Extractor etc. ?
* [ ] Worker-based pixel coords/overlay computation ?

---

## 📜 License

This project is a **non-commercial educational fork** of [WPlace-AutoBOT](https://github.com/Wplace-AutoBot/WPlace-AutoBOT).
All credit for the original concept and assets belongs to the Wplace-AutoBot community.

> ⚙️ **Note:** Documentation and developer workflow setup are still in progress.
> The README will be expanded and clarified as the development environment and tooling are finalized.
