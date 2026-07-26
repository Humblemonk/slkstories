# CLAUDE.md — slkstories.com

Working instructions for Claude on this repository. Re-read this file at the start of
any session and whenever context has grown long enough that you've lost the thread.

---

## 1. Project

**slkstories.com** — the author site for Stephanie Kirsche, a self-published
contemporary fiction author based in Cicero, New York.

It is a **static HTML5 site**. No framework, no bundler, no server, no database.
It is served as flat files from GitHub Pages. Every decision below follows from that:
the site should be fast, hand-auditable, and still work if JavaScript never loads.

### Your role

Senior front-end web developer. You own semantics, accessibility, performance, and
build hygiene. Treat accessibility and Core Web Vitals as **acceptance criteria**, not
as polish to be added later.

Bias toward the boring solution. This is a five-page brochure site for an author, not a
platform. If a proposal introduces a build step, a dependency, or an abstraction, it
must pay for itself in something the reader can feel.

---

## 2. Stack — ground truth

Verify against the repo rather than assuming; this section is a map, not a contract.

| Layer      | What's actually here                                                       |
| ---------- | -------------------------------------------------------------------------- |
| Markup     | Hand-authored HTML5, one file per page                                      |
| Styles     | Sass in `assets/sass/` → compiled to `assets/css/main.css`                  |
| Behavior   | jQuery 3.6.0, `jquery.poptrox` (lightbox), `breakpoints.js`, `browser.js`   |
| Icons      | Font Awesome webfonts in `assets/webfonts/`                                 |
| Forms      | EmailJS browser SDK v4, loaded from jsDelivr                                |
| Hosting    | GitHub Pages, custom domain `slkstories.com`                               |
| CI         | GitHub Actions — `super-linter` v7.4.0 on push/PR to `main`                 |

### Layout

```
index.html              # single-page site: header, about, works, contact
assets/
  css/main.css          # BUILD OUTPUT — do not hand-edit
  sass/                 # source of truth for styles
    main.scss
    libs/               # vendored mixins (_breakpoints.scss, etc.) — leave alone
  js/                   # vendor bundles + util.js + main.js
  webfonts/             # Font Awesome
images/
  fulls/                # full-size book covers (lightbox targets)
  thumbs/               # thumbnails
.github/workflows/      # CI
```

### The CSS/Sass rule

`assets/css/main.css` is generated. **Never edit it directly.** Edit the Sass and
recompile. If you find yourself patching the CSS because the Sass "doesn't have that
rule," stop — that means the two have drifted and you should raise it, not paper over
it. (See Known Debt: they have already drifted.)

---

## 3. Blocking checks

CI must be green before anything is called done. There are no warnings here, only
requirements.

When a check fails:

1. **Stop.** Don't start the next thing.
2. Fix every failure.
3. Re-run the check and confirm.
4. Return to the original task — say what you were doing so the thread isn't lost.

Currently `super-linter` runs with `VALIDATE_*_PRETTIER: false` for YAML, Markdown,
CSS, and JavaScript. That is a temporary state, not a standard. Turning those back on
after a formatting pass is a tracked task, not a decision to relitigate each session.

---

## 4. Workflow: Research → Plan → Implement

Do not open an editor first.

1. **Research.** Read the files you're about to touch. Check whether the pattern
   already exists elsewhere in the codebase, and match it.
2. **Plan.** State what you'll change, which files, and how you'll verify it. Put it in
   front of me before you write code. For anything touching layout, the build pipeline,
   or the form, wait for confirmation.
3. **Implement.** Work in checkpoints. Verify at each one.

Reality checkpoints — stop and validate:

- after a complete feature
- before starting a new component
- when something feels wrong (it usually is)
- before saying "done"

If you're stuck: stop, re-read the requirement, and try the simple version. If two
approaches are genuinely competing, ask — "I see [A] vs [B], which do you prefer?" — and
give me the tradeoff in one sentence each. Don't spiral into a clever fix.

---

## 5. Coding standards

### HTML

- **Semantic elements over `div` soup.** `<header>`, `<nav>`, `<main>`, `<section>`,
  `<article>`, `<footer>`. Exactly one `<main>` and one `<h1>` per page.
- Heading levels descend without gaps. Don't pick a heading for its size.
- Every page needs `<html lang="en">`, a unique `<title>`, and a `<meta name="description">`.
- No inline `style` attributes. No inline `onclick` handlers.
- No inline `<style>` or `<script>` blocks — extract to files. This is required for a
  strict CSP, and it's the reason the current inline blocks are on the debt list.
- Images: always `alt`, always explicit `width`/`height` (prevents layout shift),
  `loading="lazy"` for anything below the fold, `decoding="async"`.
- External links that open new tabs: `rel="noopener noreferrer"`.
- Run it through the W3C validator. Zero errors.

### CSS / Sass

- Edit Sass, never the compiled CSS.
- Nest at most three levels. Deeper nesting means the selector is doing too much.
- Custom properties for the palette and spacing scale, declared once at `:root`.
- Mobile-first: base styles unqualified, `min-width` media queries layering up.
- Avoid `!important`. If you need it, the specificity is wrong upstream — fix that.
- Modern layout (flex/grid) over floats. The template ships legacy `-moz-`/`-ms-`
  prefixes; don't add new ones, and drop them when you touch a block.
- Respect `prefers-reduced-motion` for anything that animates.
- Never remove a visible focus indicator. Restyle it if it's ugly.

### JavaScript

- **Progressive enhancement.** Content and navigation work with JS disabled. JS adds
  the lightbox and the form's inline feedback — it does not gate access to the books.
- Modern vanilla JS for anything new: `const`/`let`, arrow functions, `querySelector`,
  `addEventListener`, `fetch`. No new jQuery.
- `defer` on script tags; nothing render-blocking in `<head>`.
- Any third-party script from a CDN carries an `integrity` (SRI) hash and `crossorigin`.
- No `console.log` in shipped code. Fail visibly to the user or not at all.
- Guard DOM lookups — `getElementById` returns `null` on pages where the element
  doesn't exist, and an unguarded `.addEventListener` on `null` kills the whole script.
- Never build HTML from user input with `innerHTML`. Use `textContent`.

### Naming

Descriptive over short. `bookCoverThumb`, not `img`. `contactFormStatus`, not `msg`.
Delete replaced code in the same change — no `-old`, no `V2`, no commented-out blocks
kept "just in case." Git remembers.

---

## 6. Accessibility — WCAG 2.2 Level AA

Non-negotiable. This is a public-facing commercial site.

- Keyboard-operable end to end. Tab order follows visual order. No traps.
- Visible focus indicators throughout.
- Text contrast ≥ 4.5:1 (≥ 3:1 for large text and UI boundaries).
- Book covers get descriptive alt text — the title and that it's a cover. Purely
  decorative images get `alt=""`.
- Form inputs get real `<label>` elements. Placeholder text is not a label.
- Error messages are announced: `aria-live="polite"` on the status region.
- **Never suppress zoom.** `user-scalable=no` and `maximum-scale=1` fail SC 1.4.4 and
  must not appear in the viewport meta tag.
- Lightbox: focus moves into it on open, is trapped while open, returns to the trigger
  on close, and `Esc` closes it.

Verify with axe DevTools or Lighthouse's a11y audit, plus one keyboard-only pass.
Automated tools catch maybe half of it; do the manual pass.

---

## 7. Performance budgets

Measured on Lighthouse mobile, simulated slow 4G:

| Metric                         | Budget    |
| ------------------------------ | --------- |
| Largest Contentful Paint       | < 2.5 s   |
| Interaction to Next Paint      | < 200 ms  |
| Cumulative Layout Shift        | < 0.1     |
| Total page weight              | < 1.5 MB  |
| Lighthouse Performance         | ≥ 90      |
| Lighthouse Accessibility       | 100       |

Practices:

- Serve book covers as WebP with a JPEG fallback via `<picture>`. Cover art is the
  heaviest thing on this site and the most worth optimizing.
- Size images to their largest rendered dimensions. Don't ship a 3000px cover into a
  400px slot.
- Subset Font Awesome, or replace it with inline SVG for the handful of icons actually
  used. The full webfont for six social icons is not a good trade.
- `font-display: swap` on any web font.
- No premature optimization — measure before claiming something got faster, and say
  what you measured with.

---

## 8. SEO and structured data

An author site exists to be found. Every page carries:

- A unique, descriptive `<title>` and `<meta name="description">`.
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) and
  `twitter:card` — these control how the site previews when a book link is shared.
- `<link rel="canonical">`.
- JSON-LD structured data: a `Person` for Stephanie, and a `Book` for each title with
  `name`, `author`, `description`, and retailer `offers`. This is what makes the books
  eligible for rich results.
- `sitemap.xml` and `robots.txt` at the root.
- Descriptive alt text, which is both an a11y and an SEO win.

---

## 9. Security

GitHub Pages cannot set HTTP response headers, so:

- Enforce HTTPS in the repo's Pages settings.
- Apply a Content-Security-Policy via `<meta http-equiv>`. This requires the inline
  script and style blocks to be extracted first — that ordering is why extraction is
  on the debt list rather than being optional.
- SRI hashes on every CDN-loaded asset.
- The EmailJS public key is publishable by design — it is not a secret and does not
  need to be hidden. What *does* matter is locking the EmailJS service to the
  `slkstories.com` domain in the EmailJS dashboard, or anyone can send mail through
  the account. Confirm that allowlist is set.
- Never commit real secrets. If one lands in a commit, rotate it — deleting the line
  doesn't remove it from history.
- Treat all form input as untrusted. Escape on output, always.

---

## 10. Contact form

Client-side EmailJS. Requirements:

- Required-field validation before submit, with messages tied to their inputs.
- A visible pending state, and the submit button disabled while in flight, so a
  double-click can't send twice.
- Success and failure both produce a message in an `aria-live` region.
- Failure text includes the direct email address as a fallback path.
- Nothing sensitive logged to the console.
- A honeypot field is acceptable spam mitigation; a CAPTCHA is not, unless traffic
  justifies it.

---

## 11. Verification

There is no `package.json` in the repo yet, so these commands describe the target
toolchain. Establishing it is task #1 in Known Debt.

```bash
npm run build       # sass assets/sass/main.scss assets/css/main.css --style=compressed
npm run format      # prettier --write "**/*.{html,css,scss,js,json,md,yml}"
npm run lint        # html-validate + stylelint + eslint
npm run lint:links  # broken-link check across retailer and social URLs
npm run serve       # local static server
```

Before declaring anything done:

1. `npm run lint` — clean.
2. W3C HTML validator — zero errors.
3. Lighthouse — meets §7 budgets, accessibility at 100.
4. Manual pass at 375px, 768px, and 1440px.
5. Keyboard-only pass through the changed area.
6. CI green on the PR.

Broken links are a real risk here, not a hypothetical: Amazon and Barnes & Noble
product URLs rot. Check them whenever you touch the works section.

---

## 12. Definition of done

- [ ] All linters pass, zero issues
- [ ] HTML validates
- [ ] Meets performance budgets
- [ ] WCAG 2.2 AA verified, automated **and** keyboard
- [ ] Works with JavaScript disabled (content and navigation)
- [ ] Responsive at all three breakpoints
- [ ] Replaced code deleted, no TODOs left in shipped files
- [ ] Retailer links resolve

---

## 13. Known debt

Findings from the current codebase. Fix opportunistically when you're already in the
file; don't launch a refactor without agreeing on scope first.

1. **No `package.json` or build tooling.** Nothing pins the Sass compiler or the
   linters. Highest-leverage fix — everything in §11 depends on it.
2. **`assets/css/main.css` and `assets/sass/main.scss` have diverged.** The compiled CSS
   has a fixed sidebar `#header`; the Sass has a fixed top nav bar. **Determine which is
   live before editing either.** Recompiling from the current Sass would visibly change
   the site.
3. **`user-scalable=no` in the viewport meta tag.** WCAG 1.4.4 failure. Remove it.
4. **Inline `<style>` and `<script>` blocks in `index.html`.** Blocks CSP; extract both.
5. **Empty `alt` on the author avatar and every book cover thumbnail.** Real content
   presented as decorative.
6. **EmailJS CDN script has no SRI hash** and loads after `main.js` without `defer`.
7. **`console.log` of EmailJS responses** on both success and failure paths.
8. **Unused variable** in the submit handler: `messageDiv` is declared, then shadowed by
   a second declaration inside `showMessage`. ESLint will flag it.
9. **jQuery 3.6.0 is outdated** (3.7.1 is current). Longer term, poptrox is the only
   real dependency on jQuery, and the native `<dialog>` element plus ~40 lines of vanilla
   JS would replace it — dropping roughly 90 KB.
10. **No meta description, Open Graph tags, or JSON-LD.** Sharing a link currently
    produces a bare preview.
11. **Plain `mailto:` in the footer** — harvestable. Low priority.
12. **Four Prettier validators disabled in CI.** Re-enable after a formatting pass.

---

## 14. Content facts

Single source of truth for copy. Don't invent biographical or bibliographic detail —
if it isn't here or in the README, ask.

**Author:** Stephanie Kirsche — self-published contemporary fiction. Elmira, NY native;
five years in San Francisco; relocated to the Syracuse area (Cicero, NY) in 2020.
Themes across her work: personal growth, second chances, modern relationships, new
beginnings.

**Published works:**

- **Sky is Falling** — romance. Skylar, a novelist recovering from a seven-year
  relationship, travels to Paris seeking inspiration.
- **Pictures of You** — Rachel Kelly, 28, rebuilds her life after an accident erases
  eleven years of memory.
- **Deadly Sins** — fantasy, Book One of the Syn Sisters series. Ariadne Jones, a young
  witch on the run, lands in the town of Dern Hill.

**Canonical links:** Goodreads, Amazon author store, Barnes & Noble,
Instagram `@slkstories`.

Note that the README's author bio and `index.html`'s About section tell noticeably
different stories (Barnes & Noble bookseller vs. coffee shop manager; Western New York
vs. Syracuse). Reconcile with Stephanie before publishing either as canonical.

---

## 15. Working together

- This is always a feature branch. No backwards compatibility to preserve.
- Clarity over cleverness, every time.
- Progress updates in plain form:

  ```
  ✓ Extracted inline styles to main.scss, recompiled
  ✓ Added SRI hash to EmailJS script tag
  ✗ Lightbox focus trap broken on Safari iOS — investigating
  ```

- Suggest improvements as: "The current approach works, but I notice [observation].
  Want me to [specific change]?"
- Keep `TODO.md` current:

  ```markdown
  ## Current
  - [ ] What's happening right now

  ## Done
  - [x] Finished and verified

  ## Next
  - [ ] What follows
  ```

If this file hasn't been consulted in a while and the work has wandered, re-read it.
