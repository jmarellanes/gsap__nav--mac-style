import { MOTION } from "./config.js";

/**
 * @typedef {object} HoverEntry
 * @property {HTMLElement} indicator Per-panel hover indicator element.
 * @property {HTMLElement | null} activeItem Last hovered or focused panel item.
 * @property {boolean} isVisible Whether the indicator is currently visible.
 */

/**
 * Creates per-panel hover indicator interactions and render logic.
 * @param {{
 *   panelsById: Map<string, HTMLElement>
 *   config: {
 *     selectors: { panelItems: string }
 *     classes: {
 *       active: string
 *       hoverIndicator: string
 *       pillVisible: string
 *     }
 *   }
 *   tweenElement: (
 *     element: HTMLElement,
 *     vars: Record<string, string | number>,
 *     options: { duration: number, ease: string, immediate?: boolean, killProps: string[] }
 *   ) => void
 * }} options
 */
export function createPanelHoverController(options) {
  const {
    panelsById,
    config,
    tweenElement,
  } = options;

  /** @type {Map<HTMLElement, HoverEntry>} */
  const panelHoverState = new Map();

  function setup() {
    panelsById.forEach((panel) => {
      setupPanelHoverInteraction(panel);
    });
  }

  /**
   * Sets up hover interactions for a specific panel.
   * @param {HTMLElement} panel
   */
  function setupPanelHoverInteraction(panel) {
    const indicator = document.createElement("span");
    indicator.className = config.classes.hoverIndicator;
    panel.prepend(indicator);

    /** @type {HoverEntry} */
    const hoverEntry = {
      indicator,
      activeItem: null,
      isVisible: false,
    };
    panelHoverState.set(panel, hoverEntry);

    const handleItemActivate = (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const item = event.target.closest(config.selectors.panelItems);
      if (!(item instanceof HTMLElement) || !panel.contains(item)) {
        return;
      }

      if (hoverEntry.activeItem === item) {
        return;
      }

      const shouldFadeIn = !hoverEntry.isVisible;
      hoverEntry.activeItem = item;
      renderHoverIndicator(panel, {
        item,
        visible: true,
        immediate: false,
        geometryImmediate: shouldFadeIn,
      });
    };

    panel.addEventListener("pointerover", handleItemActivate);
    panel.addEventListener("focusin", handleItemActivate);
    panel.addEventListener("pointerleave", () => {
      renderHoverIndicator(panel, { visible: false });
    });
    panel.addEventListener("focusout", (event) => {
      if (!panel.contains(event.relatedTarget)) {
        renderHoverIndicator(panel, { visible: false });
      }
    });
  }

  /**
   * Renders a panel hover indicator in a single path.
   * @param {HTMLElement} panel
   * @param {{
   *   item?: HTMLElement | null,
   *   visible: boolean,
   *   immediate?: boolean,
   *   geometryImmediate?: boolean,
   * }} hoverOptions
   */
  function renderHoverIndicator(panel, hoverOptions) {
    const {
      item = null,
      visible,
      immediate = false,
      geometryImmediate = immediate,
    } = hoverOptions;
    const entry = panelHoverState.get(panel);

    if (!entry) {
      return;
    }

    const { indicator } = entry;

    if (!visible) {
      entry.activeItem = null;
      entry.isVisible = false;
      indicator.classList.toggle(config.classes.pillVisible, false);
      tweenElement(
        indicator,
        { opacity: 0 },
        {
          duration: MOTION.duration.fast,
          ease: MOTION.ease.fade,
          immediate,
          killProps: ["opacity"],
        },
      );
      return;
    }

    if (item) {
      entry.activeItem = item;
    }

    if (entry.activeItem && panel.classList.contains(config.classes.active)) {
      tweenElement(
        indicator,
        {
          "--hover-x": `${entry.activeItem.offsetLeft}px`,
          "--hover-y": `${entry.activeItem.offsetTop}px`,
          "--hover-width": `${entry.activeItem.offsetWidth}px`,
          "--hover-height": `${entry.activeItem.offsetHeight}px`,
        },
        {
          duration: MOTION.duration.base,
          ease: MOTION.ease.hover,
          immediate: geometryImmediate,
          killProps: ["--hover-x", "--hover-y", "--hover-width", "--hover-height"],
        },
      );
    }

    if (entry.isVisible) {
      return;
    }

    entry.isVisible = true;
    indicator.classList.toggle(config.classes.pillVisible, true);
    tweenElement(
      indicator,
      { opacity: 1 },
      {
        duration: MOTION.duration.fast,
        ease: MOTION.ease.fade,
        immediate,
        killProps: ["opacity"],
      },
    );
  }

  /**
   * Syncs hover indicator geometry/visibility for the active panel state.
   * @param {HTMLElement} panel
   * @param {boolean} immediate
   */
  function syncHoverIndicator(panel, immediate = true) {
    const entry = panelHoverState.get(panel);
    if (!entry) {
      return;
    }

    if (entry.activeItem && panel.classList.contains(config.classes.active)) {
      const shouldFadeIn = !entry.isVisible;
      renderHoverIndicator(panel, {
        item: entry.activeItem,
        visible: true,
        immediate: shouldFadeIn ? false : immediate,
        geometryImmediate: immediate,
      });
      return;
    }

    renderHoverIndicator(panel, { visible: false, immediate });
  }

  return {
    setup,
    renderHoverIndicator,
    syncHoverIndicator,
  };
}
