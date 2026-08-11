'use strict';

/* ==========================================================================
   Nexova — Vanilla JS Tabbed Content Logic
   Author: Senior Frontend Developer
   ========================================================================== */

/* ---------- DOM References ---------- */
const dom = {
  tabsList: document.getElementById('tabs-list'),
  indicator: document.getElementById('tab-indicator'),
  panelsViewport: document.querySelector('.panels-viewport'),
  loader: document.getElementById('panel-loader')
};

const tabs = Array.from(dom.tabsList.querySelectorAll('.tab-btn'));
const panels = Array.from(document.querySelectorAll('.tab-panel'));

const SWITCH_DELAY = 220; // ms — brief "loading" pause for a premium feel

/* ---------- State ---------- */
const state = {
  activeId: tabs.find((t) => t.classList.contains('active'))?.id || tabs[0].id,
  isSwitching: false
};

/* ==========================================================================
   Sliding Active-Tab Indicator
   Positions the pill behind the currently active tab button.
   ========================================================================== */
function moveIndicator(tabBtn) {
  dom.indicator.style.width = `${tabBtn.offsetWidth}px`;
  dom.indicator.style.transform = `translateX(${tabBtn.offsetLeft - 10}px)`;
}

function getActiveTab() {
  return tabs.find((t) => t.id === state.activeId);
}

/* ==========================================================================
   Tab Switching
   ========================================================================== */
function activateTab(tabBtn) {
  if (state.isSwitching || tabBtn.id === state.activeId) return;

  state.isSwitching = true;
  state.activeId = tabBtn.id;

  const targetPanel = document.getElementById(tabBtn.getAttribute('aria-controls'));
  const currentPanel = panels.find((p) => p.classList.contains('active'));

  // --- Update tab button states ---
  tabs.forEach((t) => {
    const isActive = t === tabBtn;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', String(isActive));
    t.tabIndex = isActive ? 0 : -1;
  });

  moveIndicator(tabBtn);
  showLoader();

  // --- Fade out current panel, then fade in the new one ---
  if (currentPanel) {
    currentPanel.classList.remove('active');
  }

  setTimeout(() => {
    panels.forEach((p) => {
      if (p !== targetPanel) p.hidden = true;
    });

    targetPanel.hidden = false;

    // Force reflow so the enter transition actually plays
    void targetPanel.offsetWidth;
    targetPanel.classList.add('active');

    hideLoader();
    scrollPanelIntoView();

    state.isSwitching = false;
  }, SWITCH_DELAY);
}

/* ==========================================================================
   Loading Shimmer (brief, for a premium "content refreshing" feel)
   ========================================================================== */
function showLoader() {
  dom.loader.classList.add('active');
}

function hideLoader() {
  dom.loader.classList.remove('active');
}

/* ==========================================================================
   Scroll Animation — bring the panels viewport smoothly into view
   (most useful on mobile, where the tab bar may sit above the fold)
   ========================================================================== */
function scrollPanelIntoView() {
  const rect = dom.panelsViewport.getBoundingClientRect();
  const isAboveViewport = rect.top < 0;

  if (isAboveViewport) {
    dom.panelsViewport.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ==========================================================================
   Click Handling
   ========================================================================== */
tabs.forEach((tabBtn) => {
  tabBtn.addEventListener('click', () => activateTab(tabBtn));
});

/* ==========================================================================
   Keyboard Navigation (ARIA Tabs Pattern)
   Left/Right (or Up/Down) moves focus between tabs; Home/End jump to ends;
   focus automatically activates the tab, matching native tab behavior.
   ========================================================================== */
dom.tabsList.addEventListener('keydown', (e) => {
  const currentIndex = tabs.findIndex((t) => t.id === state.activeId);
  let nextIndex = null;

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      nextIndex = (currentIndex + 1) % tabs.length;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      break;
    case 'Home':
      nextIndex = 0;
      break;
    case 'End':
      nextIndex = tabs.length - 1;
      break;
    default:
      return; // let all other keys behave normally
  }

  e.preventDefault();
  const nextTab = tabs[nextIndex];
  nextTab.focus();
  activateTab(nextTab);
});

/* ==========================================================================
   Keep Indicator Aligned on Window Resize
   (tab widths / positions can shift on breakpoint or font changes)
   ========================================================================== */
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => moveIndicator(getActiveTab()), 100);
});

/* ==========================================================================
   Init
   ========================================================================== */
function init() {
  // Position the indicator behind the initially active tab.
  // A short delay ensures fonts/layout have settled for an accurate width.
  requestAnimationFrame(() => moveIndicator(getActiveTab()));
}

init();
