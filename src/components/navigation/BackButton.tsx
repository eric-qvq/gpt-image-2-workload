"use client";

import React from "react";

export function BackButton() {
  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "/";
  }

  return (
    <button type="button" onClick={goBack}>
      Back
    </button>
  );
}
