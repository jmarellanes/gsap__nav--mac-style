export const CONFIG = {
  selectors: {
    dock: "#dock",
    pill: "#pill",
    tabs: ".tab",
    panels: ".panel",
    panelItems: ".item",
  },
  classes: {
    active: "is-active",
    open: "is-open",
    hoverIndicator: "item-hover-indicator",
    pillVisible: "is-visible",
  },
  attributes: {
    panel: "data-panel",
  },
};

export const MOTION = {
  duration: {
    fast: 0.15,
    base: 0.25,
  },
  ease: {
    pill: "power3.inOut",
    hover: "power3.out",
    fade: "power1.out",
  },
};
