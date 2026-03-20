import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("linkloom-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("linkloom-theme", theme);
    set({ theme });
  },
}));
