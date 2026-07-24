"use client";

import React from "react";

import { useLocalizedCopy } from "../i18n/localization";
import { useShellState } from "./ShellState";

export function ShellFooterControls() {
  const { language, setLanguage, currentModelName } = useShellState();
  const copy = useLocalizedCopy({
    en: {
      currentModel: "Current Model",
      region: "Region",
      local: "Local",
      notConnected: "Not connected"
    },
    zh: {
      currentModel: "当前模型",
      region: "区域",
      local: "本地",
      notConnected: "未连接"
    }
  });
  const displayedModelName =
    currentModelName === "Not connected"
      ? copy.notConnected
      : currentModelName;

  return (
    <div className="sidebar-footer">
      <label className="sidebar-footer__card">
        <span>Language / 语言</span>
        <select
          aria-label="Language"
          value={language}
          onChange={(event) =>
            setLanguage(event.target.value as "en" | "zh")
          }
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
      </label>
      <div className="sidebar-footer__card">
        <span>{copy.currentModel}</span>
        <strong>{displayedModelName}</strong>
      </div>
      <div className="sidebar-footer__card">
        <span>{copy.region}</span>
        <strong>{copy.local}</strong>
      </div>
    </div>
  );
}
