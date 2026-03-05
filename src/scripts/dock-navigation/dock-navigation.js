import gsap from "gsap";
import { CONFIG, MOTION } from "./config.js";
import { createDockRenderer } from "./dock-renderer.js";
import { cacheDockElements, getElementPanelId } from "./dom-elements.js";
import { createMotionDriver } from "./motion-driver.js";
import { createPanelHoverController } from "./panel-hover-controller.js";

/**
 * @typedef {object} DockElements
 * @property {HTMLElement} dock Root dock container element.
 * @property {HTMLElement} pill Tab highlight background element.
 * @property {HTMLElement[]} tabs Tab button elements in render order.
 * @property {Map<string, HTMLElement>} panelsById Panels indexed by `data-panel`.
 * @property {Map<string, HTMLElement>} tabsByPanelId First tab button indexed by `data-panel`.
 */

export class DockNavigation {
  /** @type {{ activePanelId: string | null, isOpen: boolean }} */
  #state = {
    activePanelId: null,
    isOpen: false,
  };

  /** @type {DockElements | null} */
  #elements = null;

  /** @type {ReturnType<typeof createDockRenderer> | null} */
  #renderer = null;

  /** @type {ReturnType<typeof createPanelHoverController> | null} */
  #panelHover = null;

  /** @type {((...args: unknown[]) => void) | null} */
  #tweenElement = null;

  constructor() {
    this.#init();
  }

  #init() {
    const elements = cacheDockElements(CONFIG);
    if (!elements) {
      return;
    }

    this.#elements = elements;

    const motionDriver = createMotionDriver({
      gsap,
      motion: MOTION,
    });
    this.#tweenElement = motionDriver.tweenElement;

    this.#panelHover = createPanelHoverController({
      panelsById: this.#elements.panelsById,
      config: CONFIG,
      tweenElement: this.#tweenElement,
    });

    this.#renderer = createDockRenderer({
      config: CONFIG,
      motion: MOTION,
      elementsRef: this.#elements,
      stateRef: this.#state,
      getPanelById: panelId => this.#getPanelById(panelId),
      getActiveTab: () => this.#getActiveTab(),
      panelHover: this.#panelHover,
      tweenElement: this.#tweenElement,
    });

    this.#panelHover.setup();
    this.#bindEvents();

    this.#renderer.renderTabs();
    this.#renderer.renderPill({ immediate: true });
    this.#renderer.renderDockState();
  }

  #bindEvents() {
    if (!this.#elements) {
      return;
    }

    const onTabClick = tab => () => {
      this.#handleTabSelect(getElementPanelId(tab, CONFIG));
    };

    const onEscape = event => this.#handleDocumentKeydown(event);
    const onOutsidePointerDown = event => this.#handleDocumentPointerDown(event);
    const onResize = () => this.#handleResize();

    for (const tab of this.#elements.tabs) {
      tab.addEventListener("click", onTabClick(tab));
    }

    document.addEventListener("keydown", onEscape);
    document.addEventListener("pointerdown", onOutsidePointerDown);
    window.addEventListener("resize", onResize);
  }

  #handleDocumentKeydown(event) {
    if (event.key === "Escape") {
      this.#closeMenu();
    }
  }

  #handleDocumentPointerDown(event) {
    if (!this.#state.isOpen) {
      return;
    }

    if (event.target instanceof Node && this.#elements?.dock.contains(event.target)) {
      return;
    }

    this.#closeMenu();
  }

  #handleResize() {
    this.#renderer?.renderPill({ immediate: true });

    const activePanel = this.#getActivePanel();
    if (activePanel) {
      this.#panelHover?.syncHoverIndicator(activePanel, true);
    }
  }

  // State and selectors
  /**
   * Resolves a panel id only when it exists in the current panel map.
   * @param {string | null | undefined} panelId
   * @returns {string | null} Resolved panel id or `null` when invalid.
   */
  #resolvePanelId(panelId) {
    if (!panelId || !this.#elements) {
      return null;
    }

    return this.#elements.panelsById.has(panelId) ? panelId : null;
  }

  /**
   * Gets a panel by panel id.
   * @param {string | null} panelId
   * @returns {HTMLElement | null} Matching panel element or `null`.
   */
  #getPanelById(panelId) {
    if (!panelId || !this.#elements) {
      return null;
    }

    return this.#elements.panelsById.get(panelId) ?? null;
  }

  #getActivePanel() {
    return this.#getPanelById(this.#state.activePanelId);
  }

  #getActiveTab() {
    if (!this.#state.activePanelId || !this.#elements) {
      return null;
    }

    return this.#elements.tabsByPanelId.get(this.#state.activePanelId) ?? null;
  }

  // State transitions
  /**
   * Handles tab selection logic.
   * @param {string | null} nextPanelId
   */
  #handleTabSelect(nextPanelId) {
    const resolvedPanelId = this.#resolvePanelId(nextPanelId);
    if (!resolvedPanelId) {
      return;
    }

    const wasOpen = this.#state.isOpen;

    if (this.#state.isOpen && resolvedPanelId === this.#state.activePanelId) {
      this.#closeMenu();
      return;
    }

    this.#setMenuState(true, resolvedPanelId, { fadeOnlyPill: !wasOpen });
  }

  #closeMenu() {
    if (!this.#state.isOpen) {
      return;
    }

    this.#setMenuState(false, null, { fadeOnlyPill: true });
  }

  /**
   * Commits menu state and keeps all UI updates in a single path.
   * @param {boolean} isOpen
   * @param {string | null} nextPanelId
   * @param {{ immediatePill?: boolean, fadeOnlyPill?: boolean }} options
   */
  #setMenuState(isOpen, nextPanelId, options = {}) {
    const normalizedPanelId = isOpen ? this.#resolvePanelId(nextPanelId) : null;
    if (isOpen && !normalizedPanelId) {
      return;
    }

    const nextState = {
      activePanelId: normalizedPanelId,
      isOpen,
    };

    if (
      this.#state.isOpen === nextState.isOpen
      && this.#state.activePanelId === nextState.activePanelId
    ) {
      return;
    }

    this.#renderer?.switchPanel(nextState.activePanelId);
    this.#state.activePanelId = nextState.activePanelId;
    this.#state.isOpen = nextState.isOpen;
    this.#renderer?.renderTabs();
    this.#renderer?.renderPill({
      immediate: options.immediatePill ?? false,
      fadeOnly: options.fadeOnlyPill ?? false,
    });
    this.#renderer?.renderDockState();
  }
}
