/**
 * @param {{
 *   config: {
 *     attributes: { panel: string }
 *     classes: {
 *       active: string
 *       open: string
 *       pillVisible: string
 *     }
 *   }
 *   motion: {
 *     duration: { base: number }
 *     ease: { fade: string, pill: string }
 *   }
 *   elementsRef: {
 *     dock: HTMLElement
 *     pill: HTMLElement
 *     tabs: HTMLElement[]
 *   }
 *   stateRef: {
 *     activePanelId: string | null
 *     isOpen: boolean
 *   }
 *   getPanelById: (panelId: string | null) => HTMLElement | null
 *   getActiveTab: () => HTMLElement | null
 *   panelHover: {
 *     renderHoverIndicator: (
 *       panel: HTMLElement,
 *       options: {
 *         visible: boolean
 *         immediate?: boolean
 *         item?: HTMLElement | null
 *         geometryImmediate?: boolean
 *       }
 *     ) => void
 *     syncHoverIndicator: (panel: HTMLElement, immediate?: boolean) => void
 *   }
 *   tweenElement: (
 *     element: HTMLElement,
 *     vars: Record<string, string | number>,
 *     options: { duration: number, ease: string, immediate?: boolean, killProps: string[] }
 *   ) => void
 * }} options
 */

export function createDockRenderer(options) {
  const {
    config,
    motion,
    elementsRef,
    stateRef,
    getPanelById,
    getActiveTab,
    panelHover,
    tweenElement,
  } = options;

  /**
   * Switches the active visible panel.
   * @param {string | null} nextPanelId
   */
  function switchPanel(nextPanelId) {
    const previousPanel = getPanelById(stateRef.activePanelId);
    const nextPanel = getPanelById(nextPanelId);

    renderPanelStateChange(previousPanel, nextPanel);
  }

  /**
   * Renders panel activation/deactivation and hover reconciliation.
   * @param {HTMLElement | null} previousPanel
   * @param {HTMLElement | null} nextPanel
   */
  function renderPanelStateChange(previousPanel, nextPanel) {
    if (previousPanel === nextPanel) {
      return;
    }

    if (previousPanel) {
      panelHover.renderHoverIndicator(previousPanel, { visible: false, immediate: true });
      previousPanel.classList.remove(config.classes.active);
    }

    if (nextPanel) {
      nextPanel.classList.add(config.classes.active);
      panelHover.syncHoverIndicator(nextPanel, true);
    }
  }

  function renderTabs() {
    for (const tab of elementsRef.tabs) {
      const tabPanelId = tab.getAttribute(config.attributes.panel);
      const isActive
        = stateRef.isOpen
          && tabPanelId === stateRef.activePanelId;

      tab.classList.toggle(config.classes.active, isActive);
      tab.setAttribute("aria-selected", String(isActive));
    }
  }

  function renderDockState() {
    elementsRef.dock.classList.toggle(config.classes.open, stateRef.isOpen);
  }

  /**
   * Renders the active tab pill: geometry and visibility.
   * @param {{ immediate?: boolean, fadeOnly?: boolean }} pillOptions
   */
  function renderPill(pillOptions = {}) {
    const { immediate = false, fadeOnly = false } = pillOptions;
    const { pill } = elementsRef;

    if (!stateRef.isOpen || !stateRef.activePanelId) {
      pill.classList.toggle(config.classes.pillVisible, false);
      tweenElement(
        pill,
        { opacity: 0 },
        {
          duration: motion.duration.base,
          ease: motion.ease.fade,
          immediate: fadeOnly && !immediate ? false : immediate,
          killProps: ["opacity"],
        },
      );

      if (fadeOnly && !immediate) {
        return;
      }

      tweenElement(
        pill,
        { "--pill-width": "0px" },
        {
          duration: motion.duration.base,
          ease: motion.ease.pill,
          immediate,
          killProps: ["--pill-width"],
        },
      );
      return;
    }

    const tab = getActiveTab();
    if (!tab) {
      return;
    }

    tweenElement(
      pill,
      {
        "--pill-x": `${tab.offsetLeft}px`,
        "--pill-width": `${tab.offsetWidth}px`,
      },
      {
        duration: motion.duration.base,
        ease: motion.ease.pill,
        immediate: fadeOnly && !immediate ? true : immediate,
        killProps: ["--pill-x", "--pill-width"],
      },
    );

    pill.classList.toggle(config.classes.pillVisible, true);
    tweenElement(
      pill,
      { opacity: 1 },
      {
        duration: motion.duration.base,
        ease: motion.ease.fade,
        immediate: fadeOnly && !immediate ? false : immediate,
        killProps: ["opacity"],
      },
    );
  }

  return {
    renderDockState,
    renderPill,
    renderTabs,
    switchPanel,
  };
}
