'use client';

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DEFAULT_THEME, type ThemeId, themes, isThemeId } from "@/lib/themes";
import { THEME_COOKIE, THEME_COOKIE_MAX_AGE } from "@/lib/preferences";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: typeof themes;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  themes,
});

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: ThemeId;
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window === "undefined") {
      return initialTheme;
    }

    try {
      const stored = window.localStorage.getItem(THEME_COOKIE);
      if (isThemeId(stored)) {
        return stored;
      }
    } catch {
      // ignore storage errors
    }

    if (typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp(`${THEME_COOKIE}=([^;]+)`));
      if (match && isThemeId(match[1])) {
        return match[1];
      }

      const current = document.documentElement.dataset.theme;
      if (isThemeId(current)) {
        return current;
      }
    }

    return initialTheme;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_COOKIE, theme);
    } catch {
      // ignore storage errors
    }
    document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
      themes,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
