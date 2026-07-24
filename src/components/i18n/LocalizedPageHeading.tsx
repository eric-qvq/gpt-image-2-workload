"use client";

import React from "react";

import type { LocalizedCopy } from "./localization";
import { useLocalizedCopy } from "./localization";

type PageHeadingCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

export function LocalizedPageHeading({
  id,
  copy,
  className
}: {
  id: string;
  copy: LocalizedCopy<PageHeadingCopy>;
  className?: string;
}) {
  const text = useLocalizedCopy(copy);

  return (
    <section
      className={["page-heading", className].filter(Boolean).join(" ")}
      aria-labelledby={id}
    >
      <p className="eyebrow">{text.eyebrow}</p>
      <h1 id={id}>{text.title}</h1>
      <p className="muted">{text.description}</p>
    </section>
  );
}
