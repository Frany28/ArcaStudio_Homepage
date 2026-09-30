import { useEffect, useState } from "react";

const STORAGE_KEY = "arca-theme";

/** Lee únicamente valores de tema válidos guardados por la aplicación. */
function getStoredTheme() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  return storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : null;
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return getStoredTheme() ?? getSystemTheme();
}

/**
 * Sincroniza la clase raíz con el tema persistido o la preferencia del sistema.
 * No renderiza interfaz: su responsabilidad es mantener el documento actualizado.
 */
function ThemeSync() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const storedTheme = getStoredTheme();

    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;

    if (storedTheme == null) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event) => {
      if (getStoredTheme() != null) {
        return;
      }

      setTheme(event.matches ? "dark" : "light");
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncTheme = () => {
      setTheme(getStoredTheme() ?? getSystemTheme());
    };

    window.addEventListener("storage", syncTheme);
    window.addEventListener("arca-theme-change", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("arca-theme-change", syncTheme);
    };
  }, []);

  return null;
}

export default ThemeSync;
