import { createIcons, Layers, LayoutGrid, StickyNote } from "lucide";
import { DockNavigation } from "./dock-navigation/dock-navigation.js";

createIcons({
  icons: {
    LayoutGrid,
    Layers,
    StickyNote,
  },
});

// eslint-disable-next-line no-new
new DockNavigation();
