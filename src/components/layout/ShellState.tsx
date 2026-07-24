"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

export type ShellLanguage = "en" | "zh";
export const LANGUAGE_STORAGE_KEY = "gpt-image-language";

type ShellStateValue = {
  language: ShellLanguage;
  setLanguage: (language: ShellLanguage) => void;
  currentModelName: string;
  setCurrentModelName: (name: string) => void;
  mobileNavigationOpen: boolean;
  setMobileNavigationOpen: (open: boolean) => void;
};

const ShellStateContext = createContext<ShellStateValue | null>(null);

function isShellLanguage(value: string | null): value is ShellLanguage {
  return value === "en" || value === "zh";
}

function readStoredLanguage(): ShellLanguage | null {
  try {
    const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    return isShellLanguage(value) ? value : null;
  } catch {
    return null;
  }
}

export function ShellStateProvider({
  children,
  initialModelName
}: {
  children: React.ReactNode;
  initialModelName: string;
}) {
  const [language, setLanguageState] = useState<ShellLanguage>("en");
  const [currentModelName, setCurrentModelName] = useState(initialModelName);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const setLanguage = useCallback((nextLanguage: ShellLanguage) => {
    setLanguageState(nextLanguage);

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // The in-memory preference still works when browser storage is blocked.
    }
  }, []);

  useEffect(() => {
    const storedLanguage = readStoredLanguage();

    if (storedLanguage) {
      setLanguageState(storedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.documentElement.dataset.language = language;
  }, [language]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (
        event.key === LANGUAGE_STORAGE_KEY &&
        isShellLanguage(event.newValue)
      ) {
        setLanguageState(event.newValue);
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      currentModelName,
      setCurrentModelName,
      mobileNavigationOpen,
      setMobileNavigationOpen
    }),
    [language, setLanguage, currentModelName, mobileNavigationOpen]
  );

  return (
    <ShellStateContext.Provider value={value}>
      {children}
    </ShellStateContext.Provider>
  );
}

export function useShellState(): ShellStateValue {
  const value = useContext(ShellStateContext);

  if (!value) {
    throw new Error("useShellState must be used inside ShellStateProvider");
  }

  return value;
}

export function useShellLanguage(): ShellLanguage {
  return useContext(ShellStateContext)?.language ?? "en";
}
