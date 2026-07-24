"use client";

import Link from "next/link";
import React from "react";

import { useLocalizedCopy } from "../i18n/localization";

export function HistoryToolbar({
  query,
  page,
  visibleCount,
  total,
  previousHref,
  nextHref
}: {
  query: string;
  page: number;
  visibleCount: number;
  total: number;
  previousHref?: string;
  nextHref?: string;
}) {
  const text = useLocalizedCopy({
    en: {
      filter: "Filter current page",
      placeholder: "Prompt, model, or date",
      apply: "Apply",
      summary: (visible: number, all: number, currentPage: number) =>
        `Showing ${visible} of ${all} archived images. Page ${currentPage}.`,
      pagination: "History pagination",
      previous: "Previous",
      next: "Next"
    },
    zh: {
      filter: "筛选当前页",
      placeholder: "提示词、模型或日期",
      apply: "应用",
      summary: (visible: number, all: number, currentPage: number) =>
        `显示 ${visible} / ${all} 张归档图片。第 ${currentPage} 页。`,
      pagination: "历史记录分页",
      previous: "上一页",
      next: "下一页"
    }
  });

  return (
    <section className="page-card history-toolbar">
      <form className="history-filter" method="get">
        <label>
          {text.filter}
          <input
            name="query"
            placeholder={text.placeholder}
            defaultValue={query}
          />
        </label>
        <button type="submit">{text.apply}</button>
      </form>
      <p className="muted history-summary">
        {text.summary(visibleCount, total, page)}
      </p>
      <nav
        className="button-row history-pagination"
        aria-label={text.pagination}
      >
        {previousHref ? (
          <Link className="button" href={previousHref}>
            {text.previous}
          </Link>
        ) : null}
        {nextHref ? (
          <Link className="button" href={nextHref}>
            {text.next}
          </Link>
        ) : null}
      </nav>
    </section>
  );
}
