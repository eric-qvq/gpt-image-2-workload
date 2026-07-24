"use client";

import React, { useState } from "react";

import { useLocalizedCopy } from "../i18n/localization";
import { useShellState } from "../layout/ShellState";
import {
  PrototypePageFrame,
  PrototypeStatus,
  usePrototypeFeedback
} from "./PrototypeScaffold";

type SettingsPreviewProps = {
  account: string;
  email?: string;
  role: "ADMIN" | "MEMBER";
};

export function SettingsPreview({
  account,
  email,
  role
}: SettingsPreviewProps) {
  const { language, setLanguage } = useShellState();
  const [appearance, setAppearance] = useState("system");
  const [defaultQuality, setDefaultQuality] = useState("standard");
  const [notifications, setNotifications] = useState("enabled");
  const { message, showPreviewFeedback } = usePrototypeFeedback();
  const text = useLocalizedCopy({
    en: {
      title: "Settings",
      description: "Review local preferences and the authenticated profile context.",
      save: "Save preview settings",
      profile: "Profile",
      account: "Account",
      email: "Email",
      role: "Role",
      region: "Region",
      local: "Local",
      notProvided: "Not provided",
      appearanceSection: "Appearance",
      appearance: "Appearance",
      system: "System",
      light: "Light",
      dark: "Dark",
      languageSection: "Language",
      language: "Language",
      generation: "Generation",
      defaultQuality: "Default quality",
      standard: "Standard",
      high: "High",
      notificationsSection: "Notifications",
      notifications: "Notifications",
      enabled: "Enabled",
      disabled: "Disabled"
    },
    zh: {
      title: "设置",
      description: "查看本地偏好设置和当前登录账户信息。",
      save: "保存预览设置",
      profile: "个人资料",
      account: "账户",
      email: "邮箱",
      role: "角色",
      region: "区域",
      local: "本地",
      notProvided: "未提供",
      appearanceSection: "外观",
      appearance: "外观",
      system: "跟随系统",
      light: "浅色",
      dark: "深色",
      languageSection: "语言",
      language: "语言",
      generation: "生成设置",
      defaultQuality: "默认质量",
      standard: "标准",
      high: "高",
      notificationsSection: "通知",
      notifications: "通知",
      enabled: "启用",
      disabled: "停用"
    }
  });

  return (
    <PrototypePageFrame
      title={text.title}
      description={text.description}
      actions={
        <button
          type="button"
          onClick={() =>
            showPreviewFeedback({ en: "Settings", zh: "设置" })
          }
        >
          {text.save}
        </button>
      }
    >
      <PrototypeStatus message={message} />
      <div className="settings-preview-grid">
        <section className="page-card settings-section">
          <h2>{text.profile}</h2>
          <label>
            {text.account}
            <input value={account} readOnly />
          </label>
          <label>
            {text.email}
            <input value={email ?? text.notProvided} readOnly />
          </label>
          <label>
            {text.role}
            <input value={role} readOnly />
          </label>
          <label>
            {text.region}
            <input value={text.local} readOnly />
          </label>
        </section>

        <section className="page-card settings-section">
          <h2>{text.appearanceSection}</h2>
          <label>
            {text.appearance}
            <select
              value={appearance}
              onChange={(event) => setAppearance(event.target.value)}
            >
              <option value="system">{text.system}</option>
              <option value="light">{text.light}</option>
              <option value="dark">{text.dark}</option>
            </select>
          </label>
        </section>

        <section className="page-card settings-section">
          <h2>{text.languageSection}</h2>
          <label>
            {text.language}
            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as "en" | "zh")
              }
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </label>
        </section>

        <section className="page-card settings-section">
          <h2>{text.generation}</h2>
          <label>
            {text.defaultQuality}
            <select
              value={defaultQuality}
              onChange={(event) => setDefaultQuality(event.target.value)}
            >
              <option value="standard">{text.standard}</option>
              <option value="high">{text.high}</option>
            </select>
          </label>
        </section>

        <section className="page-card settings-section">
          <h2>{text.notificationsSection}</h2>
          <label>
            {text.notifications}
            <select
              value={notifications}
              onChange={(event) => setNotifications(event.target.value)}
            >
              <option value="enabled">{text.enabled}</option>
              <option value="disabled">{text.disabled}</option>
            </select>
          </label>
        </section>
      </div>
    </PrototypePageFrame>
  );
}
