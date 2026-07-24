"use client";

import type { ShellLanguage } from "../layout/ShellState";
import { useShellLanguage } from "../layout/ShellState";

export type LocalizedCopy<T> = Record<ShellLanguage, T>;
export type LocalizedText = LocalizedCopy<string>;

export function useLocalizedCopy<T>(copy: LocalizedCopy<T>): T {
  const language = useShellLanguage();

  return copy[language];
}
