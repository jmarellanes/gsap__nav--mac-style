/**
 * Reads the element panel id from `data-panel`.
 * @param {Element} element
 * @param {{
 *   attributes: { panel: string }
 * }} config
 * @returns {string | null} Valid panel id when present, otherwise `null`.
 */
export function getElementPanelId(element, config) {
  const panelId = element.getAttribute(config.attributes.panel);
  return panelId && panelId.length > 0 ? panelId : null;
}

/**
 * Caches and validates all required dock elements.
 * @param {{
 *   selectors: {
 *     dock: string
 *     pill: string
 *     tabs: string
 *     panels: string
 *   }
 * }} config
 */
export function cacheDockElements(config) {
  const dock = document.querySelector(config.selectors.dock);
  const pill = document.querySelector(config.selectors.pill);

  if (!(dock instanceof HTMLElement) || !(pill instanceof HTMLElement)) {
    return null;
  }

  const tabs = Array.from(document.querySelectorAll(config.selectors.tabs))
    .filter(tab => tab instanceof HTMLElement);

  /** @type {Map<string, HTMLElement>} */
  const panelsById = new Map();
  const panels = Array.from(document.querySelectorAll(config.selectors.panels))
    .filter(panel => panel instanceof HTMLElement);

  for (const panel of panels) {
    const panelId = getElementPanelId(panel, config);
    if (!panelId) {
      continue;
    }

    panelsById.set(panelId, panel);
  }

  /** @type {Map<string, HTMLElement>} */
  const tabsByPanelId = new Map();
  for (const tab of tabs) {
    const panelId = getElementPanelId(tab, config);
    if (!panelId || !panelsById.has(panelId) || tabsByPanelId.has(panelId)) {
      continue;
    }

    tabsByPanelId.set(panelId, tab);
  }

  return {
    dock,
    pill,
    tabs,
    panelsById,
    tabsByPanelId,
  };
}
