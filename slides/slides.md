---
theme: default
title: Users Directory — Build Walkthrough
info: |
  Users Directory — a React Native (Expo) take-home.
  Features, architecture, hybrid search, and Detox vs Maestro findings.
class: text-left
transition: fade-out
mdc: true
colorSchema: dark
background: '#000000'
fonts:
  sans: Inter
  serif: Space Grotesk
  mono: IBM Plex Mono
  weights: '400,500,600,700'
---

<div class="cover">
  <div class="kicker">CC Main Case</div>
  <div
    class="cover__title"
    v-motion
    :initial="{ y: 28, opacity: 0 }"
    :enter="{ y: 0, opacity: 1, transition: { duration: 600 } }"
  >Users Directory App</div>
  <div class="cover__subtitle">A showcase of my implementation</div>
</div>

---

# Implementation process

<v-clicks depth="2">

- **Implemented using Claude Code 4.8 Opus** — with a sophisticated rules/architecture setup
- **Rules as guardrails** — `CLAUDE.md` + `.claude/rules` encode the conventions up front
  - `accessibility.md` —  defines accessibility rules for UI elements
  - `architecture.md` — defines how code is ogranized and how data flows
  - `performance.md` — adds rules for scalability and performance for growing datasets
  - `react-native.md` — React Native and Expo conventions, best practices
  - `testing.md` — defines testing layers, coverage rules
- **Skills incl. grill-with-docs** — used for architectural decisions 
- **Plan → build → review** — using an agent loop: `planner` → `implementer` → `reviewer` per feature
- **Verified every step** — `typecheck`, `lint`, `test` and `/review` before "done"
- **Manual code review** — reviewed the code by myself + review by Claude Code using matt pocock skills

</v-clicks>

<style>
/* Slide-scoped: smaller list text on the Implementation process slide. */
.slidev-layout ul li { font-size: 0.8rem; line-height: 1.3; }
</style>

---
layout: two-cols
layoutClass: gap-10 features-slide
---

<script setup>
import featureVideo from './assets/cc-main-case-video-1.mov'
</script>

# Implemented Features

<v-clicks>

- **Users list** — avatar · full name · email
- **Pagination** — 30/page, virtualized
- **Pull-to-refresh** + loading / error / empty
- **Search** — debounced, clear & reset
- **Detail screen** — rich info, fetch by stable id
- **Collapsible header** — Reanimated, scroll-driven
- **Detox** — E2E testing suite

</v-clicks>

<div class="kicker mt-5" v-click>Extras</div>

<v-clicks>

- **Hybrid search** — API + cache (when `hasNextPage == false`), offline-ready 
- **Sort A–Z / Z–A** — API + cache (when `hasNextPage == false`)
- **Sticky alphabet headers**
- **Animated Skeletons**
- **Maestro** - Additional E2E test suite, more on this in the next slides

</v-clicks>

::right::

<div class="video-stage">
  <video class="feature-video" :src="featureVideo" autoplay loop muted playsinline></video>
</div>

<style>
/* Slide-scoped: slightly smaller list text on the Features slide. */
.slidev-layout ul li { font-size: 0.78rem; line-height: 1.3; }

/* Just centers the video; the gradient now lives on the slide background. */
.video-stage {
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;   /* lift the video above the fade overlay */
  z-index: 20;          /* > the .slidev-layout::after fade (z-index: 10) */
}
.feature-video {
  max-height: 95%;   /* relative to the slide, not the browser viewport */
  max-width: 100%;
  object-fit: contain;
  border-radius: 12px;
}

/* Horizontal fade so the slide-left transition into the next slide is smooth:
   0–50% untouched, 50–85% fades to black, 85–100% fades back to the bg color. */
.slidev-layout { position: relative; }
</style>

---
layout: two-cols
layoutClass: gap-10
transition: none
---

<script setup>
import archLayers from './assets/architecture_overview_1.png'
</script>

# Architecture

<v-clicks depth="2">

- **Stack**
  - Expo (React Native, TypeScript strict)
  - React Navigation native-stack
  - TanStack Query
  - Reanimated
  - Jest + React Native Testing Library + MSW
  - Detox & Maestro for E2E testing
- **Strict layering, one-way dependencies**
  - `/app` is the entry point
  - `/features` defines the features; in this case: **users**
  - `/ui` basic design-system, including: **Button, Text, Card, Avatar, Input**
  - `/lib` contains http clients and environment configs

</v-clicks>

::right::

<div class="arch-img-wrap" v-click="8">
  <img :src="archLayers" alt="Four layers — imports flow downward only; ui/ and lib/ import nothing upward" />
</div>

<style>
/* Slide-scoped: smaller list text on the Architecture slide. */
.slidev-layout ul li { font-size: 0.8rem; line-height: 1.3; }

/* Architecture image (right column), vertically centered. */
.arch-img-wrap { height: 100%; display: flex; align-items: center; justify-content: center; }
.arch-img-wrap img { max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 12px; box-shadow: 0 0 12px rgba(255, 255, 255, 0.18), 0 0 28px rgba(255, 255, 255, 0.1); }
</style>

---
layout: two-cols
layoutClass: gap-10
---

<script setup>
import archFeatures from './assets/architecture_overview_2.png'
</script>

# Architecture

- **Feature-first**
  - `features/users` owns api definitions, components to build the feature, screens to navigate to and types, such as `User`
<v-clicks depth="2">

- **State, placed deliberately**
  - Remote/server data is cached and managed by React Query
  - Navigation layer carries only the lightweight userId between screens
  - On-screen state (like the search text or expanded/collapsed) is held locally with useState
- **Infrastructure** 
  - One `apiClient` (timeout · abort · normalized `ApiError`) + a shared `queryClient`
- **Design system**
  - 8 theme-driven components with accessibility baked in

</v-clicks>

::right::

<div class="arch-img-wrap">
  <img :src="archFeatures" alt="features/users — one feature = one self-contained vertical slice" />
</div>

<style>
/* Slide-scoped: smaller list text on the Architecture slide. */
.slidev-layout ul li { font-size: 0.72rem; line-height: 1.25; }
/* Keep the un-clicked first list and the clicked list visually tight. */
.slidev-layout ul { margin: 0; }

/* Architecture image (right column), vertically centered. */
.arch-img-wrap { height: 100%; display: flex; align-items: center; justify-content: center; }
.arch-img-wrap img { max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 12px; box-shadow: 0 0 12px rgba(255, 255, 255, 0.18), 0 0 28px rgba(255, 255, 255, 0.1); }
</style>

---

# Details: Search

<v-clicks depth="2">

- **Initially search performs a request** 
  - calls the `/users/search` endpoint, and waits ~350ms after you stop typing so it doesn't fire a request on every keystroke

- **When the whole list is already cached** 
  - filters locally instead: no network requests at all, and it keeps working offline

- **Offline capabilities**
  - **If only part of the list is cached and you're online** — asks the server, because the local data isn't complete enough to trust
  - **If only part is cached and you're offline** — it shows the best matches it can find locally, and tells you the results may be incomplete

</v-clicks>

---

# Details: E2E testing

<v-clicks depth="2">

- **One single flow for feature `users`** (users overview, user details, sorting feature)

- **Both Detox and Maestro are able to run E2E tests with debug and release builds**

- **Why Detox & Maestro?** 
  - Detox sets animation spec to 0 on Android Emulators, making it impossible to test the user details header transition
  - Maestro does not change the animation spec on Android

- **In a Real-world scenario** 
  - Preferring Maestro over Detox -> easier to use, less flaky (poll-and-retry), lower setup cost (declarative YAML)

</v-clicks>

---
layout: two-cols
layoutClass: gap-10
class: items-center
---

<script setup>
// Imported (not /public) so the bundler resolves it and respects --base.
import qrUrl from './assets/qr.png'
</script>

# Outro

**Key Learnings**
<v-clicks>

- Excellent architectural design by defining `/rules` for Claude
- Implementing some bonus features to make the feature `users` *complete* made sense
- Comparing Detox vs. Maestro helped me understand the decision in the team (switch from Detox to Maestro)
- AI-assisted development scales on structure, not generation
- Writing the tradeoffs down is part of the engineering

</v-clicks>

::right::

<div class="flex flex-col items-center justify-center h-full qr-reveal" v-click="6">
  <div class="qr-card">
    <img :src="qrUrl" alt="QR code to the GitHub repository" />
  </div>
  <div class="qr-label">github.com/arturschwarz/cc-main-case</div>
  <v-click at="6">
    <div class="cover__meta">Thanks for watching!</div>
  </v-click>
</div>

<style scoped>
/* Scale + fade the QR card in when its click (6) fires — the reveal is tied to
   the click flow, not to slide entry (which is what v-motion :enter did). */
.qr-reveal {
  transition: opacity 500ms ease, transform 500ms ease;
}
.qr-reveal.slidev-vclick-hidden {
  opacity: 0;
  transform: scale(0.85);
}
</style>
