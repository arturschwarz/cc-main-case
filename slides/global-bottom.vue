<!--
  Rendered on every slide. A bottom footer made of:
   1. a deck progress bar (fill width = $page / total), and
   2. a row beneath it: the deck title (left) and the page count (right).
-->
<template>
  <footer class="pp-footer">
    <div class="pp-progress" aria-hidden="true">
      <div
        class="pp-progress__fill"
        :style="{ width: ($nav.total > 1 ? ($page / $nav.total) * 100 : 0) + '%' }"
      ></div>
    </div>
    <div class="pp-footer__row">
      <span class="pp-footer__title">Users Directory App <span class="pp-footer__by">by Artur Schwarz</span></span>
      <span class="pp-footer__page">{{ $page }}/{{ $nav.total }}</span>
    </div>
  </footer>
</template>

<style>
.pp-footer {
  position: absolute;
  left: 3.4rem;
  right: 3.4rem;
  bottom: 1rem;
  z-index: 100;              /* sit above the opaque slide background */
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  pointer-events: none;
}
.pp-progress {
  width: 100%;
  height: 3px;
  background: #2b2e35;       /* dim track */
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}
.pp-progress__fill {
  height: 100%;
  background: #e9eaed;       /* bright progress fill */
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.35), 0 0 9px rgba(255, 255, 255, 0.2);
  transition: width 450ms ease;
}
.pp-footer__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #767c87;
}
.pp-footer__page { font-variant-numeric: tabular-nums; }
.pp-footer__by {
  font-size: 0.82em;
  text-transform: none;
  letter-spacing: 0.02em;
  color: #5e646e;
  margin-left: 0.4rem;
}
</style>
