import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type CssBlock = {
  prelude: string;
  body: string;
};

type CssDeclaration = {
  property: string;
  value: string;
};

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "");
}

function findOpeningBrace(source: string, start: number): number {
  let quote = "";

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (character === "\\") {
        index += 1;
      } else if (character === quote) {
        quote = "";
      }

      continue;
    }

    if (character === "\"" || character === "'") {
      quote = character;
    } else if (character === "{") {
      return index;
    }
  }

  return -1;
}

function findClosingBrace(source: string, openingBrace: number): number {
  let depth = 0;
  let quote = "";

  for (let index = openingBrace; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (character === "\\") {
        index += 1;
      } else if (character === quote) {
        quote = "";
      }

      continue;
    }

    if (character === "\"" || character === "'") {
      quote = character;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  throw new Error(`Unclosed CSS block at index ${openingBrace}`);
}

function readTopLevelBlocks(source: string): CssBlock[] {
  const css = stripComments(source);
  const blocks: CssBlock[] = [];
  let cursor = 0;

  while (cursor < css.length) {
    while (/\s|;/.test(css[cursor] ?? "")) {
      cursor += 1;
    }

    const openingBrace = findOpeningBrace(css, cursor);

    if (openingBrace < 0) {
      break;
    }

    const closingBrace = findClosingBrace(css, openingBrace);
    const rawPrelude = css.slice(cursor, openingBrace);
    const prelude = rawPrelude.slice(rawPrelude.lastIndexOf(";") + 1).trim();

    if (prelude) {
      blocks.push({
        prelude,
        body: css.slice(openingBrace + 1, closingBrace)
      });
    }

    cursor = closingBrace + 1;
  }

  return blocks;
}

function splitTopLevel(source: string, delimiter: string): string[] {
  const parts: string[] = [];
  let current = "";
  let parentheses = 0;
  let brackets = 0;
  let quote = "";

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      current += character;

      if (character === "\\") {
        current += source[index + 1] ?? "";
        index += 1;
      } else if (character === quote) {
        quote = "";
      }

      continue;
    }

    if (character === "\"" || character === "'") {
      quote = character;
      current += character;
    } else if (character === "(") {
      parentheses += 1;
      current += character;
    } else if (character === ")") {
      parentheses -= 1;
      current += character;
    } else if (character === "[") {
      brackets += 1;
      current += character;
    } else if (character === "]") {
      brackets -= 1;
      current += character;
    } else if (
      character === delimiter &&
      parentheses === 0 &&
      brackets === 0
    ) {
      parts.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

function getRuleBodies(source: string, selector: string): string[] {
  return readTopLevelBlocks(source)
    .filter((block) => !block.prelude.startsWith("@"))
    .filter((block) =>
      splitTopLevel(block.prelude, ",").includes(selector)
    )
    .map((block) => block.body);
}

function parseDeclarationEntries(body: string): CssDeclaration[] {
  const declarations: CssDeclaration[] = [];

  for (const declaration of splitTopLevel(body, ";")) {
    const colon = declaration.indexOf(":");

    if (colon < 0) {
      continue;
    }

    const property = declaration.slice(0, colon).trim().toLowerCase();
    const value = declaration.slice(colon + 1).trim();

    if (property && value) {
      declarations.push({ property, value });
    }
  }

  return declarations;
}

function parseDeclarations(body: string): Map<string, string> {
  const declarations = new Map<string, string>();

  for (const declaration of parseDeclarationEntries(body)) {
    declarations.set(declaration.property, declaration.value);
  }

  return declarations;
}

function getDeclarationEntries(source: string, selector: string): CssDeclaration[] {
  const declarations: CssDeclaration[] = [];

  for (const body of getRuleBodies(source, selector)) {
    declarations.push(...parseDeclarationEntries(body));
  }

  return declarations;
}

function getDeclarations(source: string, selector: string): Map<string, string> {
  const declarations = new Map<string, string>();

  for (const body of getRuleBodies(source, selector)) {
    for (const [property, value] of parseDeclarations(body)) {
      declarations.set(property, value);
    }
  }

  return declarations;
}

function getAtRuleBody(
  source: string,
  predicate: (prelude: string) => boolean
): string | undefined {
  return readTopLevelBlocks(source).find((block) => predicate(block.prelude))?.body;
}

function getMediaBody(source: string, breakpoint: number): string | undefined {
  const mediaPattern = new RegExp(
    `^@media\\s*\\(\\s*max-width\\s*:\\s*${breakpoint}px\\s*\\)$`,
    "i"
  );

  return getAtRuleBody(source, (prelude) => mediaPattern.test(prelude));
}

function getMinWidthMediaBody(
  source: string,
  breakpoint: number
): string | undefined {
  const mediaPattern = new RegExp(
    "^@media\\s*\\(\\s*min-width\\s*:\\s*" +
      breakpoint +
      "px\\s*\\)$",
    "i"
  );

  return getAtRuleBody(source, (prelude) => mediaPattern.test(prelude));
}

function normalizeValue(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

function hasNetworkImport(source: string): boolean {
  const importPattern = /@import\b[^;]*(?:;|$)/gi;
  const css = stripComments(source);
  let match: RegExpExecArray | null;

  while ((match = importPattern.exec(css)) !== null) {
    if (/(?:https?:\/\/|(?:^|[\s('\"])\/\/)/i.test(match[0])) {
      return true;
    }
  }

  return false;
}

function hasDarkColorScheme(source: string): boolean {
  return /color-scheme\s*:[^;{}]*\bdark\b/i.test(stripComments(source));
}

function findNonCanvasBackgrounds(source: string, selector: string): string[] {
  const violations: string[] = [];
  let hasCanvas = false;

  for (const declaration of getDeclarationEntries(source, selector)) {
    if (
      declaration.property !== "background" &&
      declaration.property !== "background-color"
    ) {
      continue;
    }

    const value = normalizeValue(declaration.value).replace(/\s*!important$/, "");

    if (value === "var(--canvas)" || value === "#f7f8fc") {
      hasCanvas = true;
    } else if (value !== "transparent" && value !== "none") {
      violations.push(`${selector}:${declaration.property}:${value}`);
    }
  }

  if (!hasCanvas) {
    violations.push(`${selector}:missing-canvas`);
  }

  return violations;
}

function hasBodyVisualBackground(source: string): boolean {
  for (const body of getRuleBodies(source, "body")) {
    const declarations = parseDeclarations(body);
    const background = normalizeValue(declarations.get("background"));
    const backgroundImage = normalizeValue(declarations.get("background-image"));

    if (/(?:gradient|url|image-set)\s*\(/i.test(background)) {
      return true;
    }

    if (backgroundImage && backgroundImage !== "none") {
      return true;
    }
  }

  for (const selector of [
    "body::before",
    "body::after",
    "html::before",
    "html::after"
  ]) {
    for (const declaration of getDeclarationEntries(source, selector)) {
      if (
        declaration.property !== "background" &&
        declaration.property !== "background-color" &&
        declaration.property !== "background-image"
      ) {
        continue;
      }

      const value = stripImportant(declaration.value);

      if (value && value !== "none" && value !== "transparent") {
        return true;
      }
    }
  }

  return false;
}

function findBroadElementCardStyles(source: string): string[] {
  const violations: string[] = [];
  const broadElements = ["section", "aside", "form", "article"];

  for (const selector of broadElements) {
    for (const body of getRuleBodies(source, selector)) {
      for (const property of parseDeclarations(body).keys()) {
        if (
          property === "background" ||
          property === "background-color" ||
          property === "background-image" ||
          property === "box-shadow" ||
          property === "backdrop-filter" ||
          property === "border" ||
          property.startsWith("border-") ||
          property === "padding" ||
          property.startsWith("padding-")
        ) {
          violations.push(`${selector}:${property}`);
        }
      }
    }
  }

  return violations;
}

function hasGlobalMainLayout(source: string): boolean {
  for (const body of getRuleBodies(source, "main")) {
    const declarations = parseDeclarations(body);

    if (declarations.has("width") || declarations.has("max-width")) {
      return true;
    }

    for (const property of ["margin", "margin-inline", "margin-left", "margin-right"]) {
      if (/\bauto\b/i.test(declarations.get(property) ?? "")) {
        return true;
      }
    }
  }

  return false;
}

function hasPillRadius(value: string | undefined): boolean {
  const radiusPattern = /(\d+(?:\.\d+)?)(px|%)/gi;
  let match: RegExpExecArray | null;

  while ((match = radiusPattern.exec(value ?? "")) !== null) {
    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    if ((unit === "px" && amount >= 100) || (unit === "%" && amount >= 50)) {
      return true;
    }
  }

  return false;
}

function hasGlobalButtonPrimaryStyle(source: string): boolean {
  for (const body of getRuleBodies(source, "button")) {
    const declarations = parseDeclarations(body);
    const background = [
      declarations.get("background"),
      declarations.get("background-image")
    ].join(" ");

    if (
      /(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(/i.test(background)
    ) {
      return true;
    }

    if (hasPillRadius(declarations.get("border-radius"))) {
      return true;
    }
  }

  return false;
}

function stripImportant(value: string | undefined): string {
  return normalizeValue(value).replace(/\s*!important$/, "");
}

function parseLength(token: string): number | undefined {
  const match = /^(-?\d*(?:\.\d+)?)(?:px|rem|em|ex|ch|vw|vh|vmin|vmax)?$/i.exec(token);

  if (!match || !match[1]) {
    return undefined;
  }

  return Number(match[1]);
}

function hasNonTransparentColor(value: string): boolean {
  const color = stripImportant(value);

  if (!color || /\btransparent\b/i.test(color)) {
    return false;
  }

  const functionPattern = /(rgba?|hsla?)\(([^)]*)\)/gi;
  let functionMatch: RegExpExecArray | null;

  while ((functionMatch = functionPattern.exec(color)) !== null) {
    const functionName = functionMatch[1].toLowerCase();
    const argumentsText = functionMatch[2];
    const slashAlpha = argumentsText.includes("/")
      ? argumentsText.slice(argumentsText.lastIndexOf("/") + 1).trim()
      : undefined;
    const commaParts = argumentsText.split(",");
    const commaAlpha =
      (functionName === "rgba" || functionName === "hsla") && commaParts.length >= 4
        ? commaParts[commaParts.length - 1].trim()
        : undefined;
    const alphaText = slashAlpha ?? commaAlpha;

    if (!alphaText) {
      return true;
    }

    const alpha = alphaText.endsWith("%")
      ? Number.parseFloat(alphaText) / 100
      : Number.parseFloat(alphaText);

    if (Number.isFinite(alpha) && alpha > 0) {
      return true;
    }
  }

  const hexPattern = /#([0-9a-f]{3,8})\b/gi;
  let hexMatch: RegExpExecArray | null;

  while ((hexMatch = hexPattern.exec(color)) !== null) {
    const hex = hexMatch[1];
    const alphaHex = hex.length === 4 ? hex.slice(3) : hex.length === 8 ? hex.slice(6) : "ff";

    if (Number.parseInt(alphaHex.length === 1 ? `${alphaHex}${alphaHex}` : alphaHex, 16) > 0) {
      return true;
    }
  }

  return /\bcurrentcolor\b|var\s*\(/i.test(color);
}

function hasPositiveOutlineWidth(value: string): boolean {
  if (/\b(?:thin|medium|thick)\b/i.test(value)) {
    return true;
  }

  return value
    .split(/\s+/)
    .map(parseLength)
    .some((length) => length !== undefined && Math.abs(length) > 0);
}

function hasVisibleOutline(declarations: Map<string, string>): boolean {
  const shorthand = stripImportant(declarations.get("outline"));
  const width = stripImportant(declarations.get("outline-width")) || shorthand;
  const style = stripImportant(declarations.get("outline-style")) || shorthand;
  const color = stripImportant(declarations.get("outline-color")) || shorthand;

  return (
    hasPositiveOutlineWidth(width) &&
    /\b(?:auto|solid|dotted|dashed|double|groove|ridge|inset|outset)\b/i.test(style) &&
    hasNonTransparentColor(color)
  );
}

function hasVisibleBoxShadow(value: string | undefined): boolean {
  for (const shadow of splitTopLevel(stripImportant(value), ",")) {
    if (!hasNonTransparentColor(shadow)) {
      continue;
    }

    const lengthsOnly = shadow
      .replace(/(?:rgb|hsl)a?\([^)]*\)|#[0-9a-f]{3,8}\b|var\([^)]*\)|\bcurrentcolor\b/gi, " ")
      .split(/\s+/)
      .map(parseLength);

    if (lengthsOnly.some((length) => length !== undefined && Math.abs(length) > 0)) {
      return true;
    }
  }

  return false;
}

function hasVisibleFocusRule(source: string): boolean {
  for (const block of readTopLevelBlocks(source)) {
    const hasFocusSelector =
      !block.prelude.startsWith("@") &&
      splitTopLevel(block.prelude, ",").some((selector) =>
        selector.includes(":focus-visible")
      );

    if (!hasFocusSelector) {
      continue;
    }

    const declarations = parseDeclarations(block.body);

    if (hasVisibleOutline(declarations) || hasVisibleBoxShadow(declarations.get("box-shadow"))) {
      return true;
    }
  }

  return false;
}

function hasNearZeroDurations(value: string | undefined): boolean {
  const durations = splitTopLevel(stripImportant(value), ",");

  return durations.length > 0 && durations.every((duration) => {
    if (/^0(?:ms|s)?$/.test(duration)) {
      return true;
    }

    const match = /^(\d+(?:\.\d+)?)(ms|s)$/.exec(duration);

    if (!match) {
      return false;
    }

    const milliseconds = Number(match[1]) * (match[2] === "s" ? 1000 : 1);

    return milliseconds <= 0.1;
  });
}

function isNoneValue(value: string | undefined): boolean {
  const values = splitTopLevel(stripImportant(value), ",");

  return values.length > 0 && values.every((item) => item === "none");
}

function hasReducedMotionRule(source: string): boolean {
  const media = getAtRuleBody(source, (prelude) =>
    /^@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)$/i.test(prelude)
  );
  const declarations = getDeclarations(media ?? "", "*");
  const animationReduced =
    hasNearZeroDurations(declarations.get("animation-duration")) ||
    isNoneValue(declarations.get("animation")) ||
    isNoneValue(declarations.get("animation-name"));
  const transitionReduced =
    hasNearZeroDurations(declarations.get("transition-duration")) ||
    isNoneValue(declarations.get("transition")) ||
    isNoneValue(declarations.get("transition-property"));

  return Boolean(media) && animationReduced && transitionReduced;
}

function isSingleColumn(value: string | undefined): boolean {
  const compact = normalizeValue(value).replace(/\s+/g, "");

  return compact === "1fr" || compact === "minmax(0,1fr)";
}

const styles = readFileSync(
  resolve(process.cwd(), "src/app/globals.css"),
  "utf8"
);

describe("CSS contract helpers", () => {
  it.each([
    ['@import url("https://fonts.example/font.css");'],
    ['@import "https://fonts.example/font.css";'],
    ["@import 'http://fonts.example/font.css';"],
    ["@import   url( 'https://fonts.example/font.css' ) screen;"],
    ['@import "//fonts.example/font.css";'],
    ["@import url(//fonts.example/font.css);"]
  ])("detects a network import in %s", (fixture) => {
    expect(hasNetworkImport(fixture)).toBe(true);
  });

  it("allows local imports while rejecting late dark schemes and body imagery", () => {
    expect(hasNetworkImport('@import "./local.css";')).toBe(false);
    expect(
      hasDarkColorScheme(`
        html { color-scheme: light; }
        html { color-scheme: dark; }
      `)
    ).toBe(true);
    expect(
      hasBodyVisualBackground(`
        body { background: linear-gradient(#fff, #eee); }
      `)
    ).toBe(true);
    expect(
      hasBodyVisualBackground(`
        body { background: var(--canvas); }
        body::before { background-image: linear-gradient(#fff 1px, transparent 1px); }
      `)
    ).toBe(true);
    expect(
      hasBodyVisualBackground(`
        body::after {
          background-image: repeating-linear-gradient(#fff 0 1px, transparent 1px 8px);
        }
      `)
    ).toBe(true);
    expect(
      hasBodyVisualBackground(`
        html::before { background: url("https://assets.example/grid.png"); }
      `)
    ).toBe(true);
    expect(
      hasBodyVisualBackground(`
        html::after { background: #020617; }
      `)
    ).toBe(true);
  });

  it("detects any later non-canvas html or body background declaration", () => {
    expect(
      findNonCanvasBackgrounds(`
        body { background: var(--canvas); }
        body { background-color: #020617; }
      `, "body")
    ).not.toEqual([]);
    expect(
      findNonCanvasBackgrounds(`
        html { background: #f7f8fc; }
        html { background: #0f172a; }
      `, "html")
    ).not.toEqual([]);
    expect(
      findNonCanvasBackgrounds(`
        body { background: var(--canvas); }
        body { background-color: transparent; }
      `, "body")
    ).toEqual([]);
  });

  it("detects independent section, form, button, and main regressions", () => {
    expect(
      findBroadElementCardStyles("section { border: 1px solid #ddd; padding: 1rem; }")
    ).not.toEqual([]);
    expect(
      findBroadElementCardStyles("form { background: #fff; border-radius: 12px; }")
    ).not.toEqual([]);
    expect(
      hasGlobalButtonPrimaryStyle(`
        button, .button {
          border-radius: 999px;
          background: linear-gradient(#4f46e5, #7c3aed);
        }
      `)
    ).toBe(true);
    expect(
      hasGlobalMainLayout("main { max-width: 1200px; margin: 0 auto; }")
    ).toBe(true);
  });

  it.each([
    "linear-gradient(#fff, #000)",
    "radial-gradient(#fff, #000)",
    "conic-gradient(#fff, #000)",
    "repeating-linear-gradient(#fff, #000)",
    "repeating-radial-gradient(#fff, #000)"
  ])("detects a global button background using %s", (background) => {
    expect(
      hasGlobalButtonPrimaryStyle(`button { background: ${background}; }`)
    ).toBe(true);
  });

  it.each(["9999px", "50%"])(
    "detects a global button pill radius of %s",
    (radius) => {
      expect(
        hasGlobalButtonPrimaryStyle(`button { border-radius: ${radius}; }`)
      ).toBe(true);
    }
  );

  it("does not mistake class selectors or media-contained rules for global pollution", () => {
    const fixture = `
      .section { padding: 2rem; background: #fff; }
      form.admin-form { padding: 1rem; }
      main.app-content { max-width: 1200px; }
      button.primary-button { border-radius: 999px; }
      @media (max-width: 767px) {
        section { padding: 1rem; }
      }
    `;

    expect(findBroadElementCardStyles(fixture)).toEqual([]);
    expect(hasGlobalMainLayout(fixture)).toBe(false);
    expect(hasGlobalButtonPrimaryStyle(fixture)).toBe(false);
  });

  it("extracts a complete media block even when it contains nested braces", () => {
    const fixture = `
      @media (max-width: 767px) {
        .before { display: grid; }
        @supports (display: grid) {
          .nested { grid-template-columns: 1fr; }
        }
        .after { overflow-x: auto; }
      }
    `;
    const media = getMediaBody(fixture, 767) ?? "";

    expect(media).not.toBe("");
    expect(getDeclarations(media, ".before").get("display")).toBe("grid");
    expect(getDeclarations(media, ".after").get("overflow-x")).toBe("auto");
  });

  it("requires a real visible declaration in a focus-visible rule", () => {
    expect(hasVisibleFocusRule('body::before { content: ":focus-visible"; }')).toBe(false);
    expect(hasVisibleFocusRule("button:focus-visible {}")).toBe(false);
    expect(
      hasVisibleFocusRule("button:focus-visible { outline: none; box-shadow: none; }")
    ).toBe(false);
    expect(
      hasVisibleFocusRule("button:focus-visible { outline: 0 solid #4f46e5; }")
    ).toBe(false);
    expect(
      hasVisibleFocusRule("button:focus-visible { outline: 0px solid #4f46e5; }")
    ).toBe(false);
    expect(
      hasVisibleFocusRule("button:focus-visible { outline: 2px solid transparent; }")
    ).toBe(false);
    expect(
      hasVisibleFocusRule("button:focus-visible { box-shadow: 0 0 0 transparent; }")
    ).toBe(false);
    expect(
      hasVisibleFocusRule("button:focus-visible { box-shadow: 0 0 0 #4f46e5; }")
    ).toBe(false);
    expect(
      hasVisibleFocusRule("button:focus-visible { outline: 2px solid #4f46e5; }")
    ).toBe(true);
    expect(
      hasVisibleFocusRule("button:focus-visible { box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.24); }")
    ).toBe(true);
  });

  it("accepts only disabled or near-zero animation and transition motion", () => {
    expect(
      hasReducedMotionRule(`
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 5s; transition-duration: 500ms; }
        }
      `)
    ).toBe(false);
    expect(
      hasReducedMotionRule(`
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.1ms; transition-duration: 0ms; }
        }
      `)
    ).toBe(true);
    expect(
      hasReducedMotionRule(`
        @media (prefers-reduced-motion: reduce) {
          * { animation: none; transition: none; }
        }
      `)
    ).toBe(true);
  });
});

describe("global style contract", () => {
  it("uses a local system font stack without any network import syntax", () => {
    const body = getDeclarations(styles, "body");

    expect(hasNetworkImport(styles)).toBe(false);
    expect(body.get("font-family")).toMatch(
      /(?:system-ui|-apple-system|"Segoe UI")/i
    );
  });

  it("keeps html and body on the approved light canvas without hidden imagery", () => {
    const root = getDeclarations(styles, ":root");
    const html = getDeclarations(styles, "html");

    expect(hasDarkColorScheme(styles)).toBe(false);
    expect(normalizeValue(html.get("color-scheme"))).toContain("light");
    expect(findNonCanvasBackgrounds(styles, "html")).toEqual([]);
    expect(findNonCanvasBackgrounds(styles, "body")).toEqual([]);
    expect(hasBodyVisualBackground(styles)).toBe(false);
    expect(normalizeValue(root.get("--canvas"))).toBe("#f7f8fc");
    expect(normalizeValue(root.get("--surface"))).toMatch(/^#fff(?:fff)?$/);
    expect(normalizeValue(root.get("--border"))).toMatch(/^#(?:e2e8f0|dbe2ea)$/);
    expect(normalizeValue(root.get("--primary"))).toBe("#4f46e5");
  });

  it("keeps broad elements free of card, centered-page, and primary-button pollution", () => {
    expect(findBroadElementCardStyles(styles)).toEqual([]);
    expect(hasGlobalMainLayout(styles)).toBe(false);
    expect(hasGlobalButtonPrimaryStyle(styles)).toBe(false);
  });

  it("defines real rule blocks for every major interface region", () => {
    const requiredSelectors = [
      "app-shell",
      "app-header",
      "app-header__actions",
      "app-shell-body",
      "app-sidebar",
      "sidebar-nav",
      "sidebar-footer",
      "app-content",
      "shell-popover",
      "mobile-menu-button",
      "mobile-nav-backdrop",
      "mobile-nav-drawer",
      "page-heading",
      "create-page-layout",
      "create-toolbar",
      "generation-workspace",
      "generation-editor",
      "prompt-panel",
      "preview-panel",
      "preview-stage",
      "generation-parameters",
      "quality-segments",
      "style-segments",
      "guidance-scale__limits",
      "safety-switch",
      "generation-submit",
      "enhance-prompt-action",
      "prototype-notice",
      "prototype-dialog",
      "create-lower-grid",
      "recent-generations",
      "todays-usage",
      "prototype-table",
      "model-catalog",
      "history-toolbar",
      "admin-form",
      "login-page",
      "image-lightbox"
    ];

    for (const selector of requiredSelectors) {
      expect(
        getRuleBodies(styles, `.${selector}`).length,
        `missing rule for .${selector}`
      ).toBeGreaterThan(0);
    }
  });

  it("locks the desktop shell and generation workspace to the approved proportions", () => {
    const header = getDeclarations(styles, ".app-header");
    const shellBody = getDeclarations(styles, ".app-shell-body");
    const pageLayout = getDeclarations(styles, ".create-page-layout");
    const workbenchContents = getDeclarations(
      styles,
      ".create-page-layout > .create-workbench"
    );
    const workspaceContents = getDeclarations(
      styles,
      ".create-page-layout .generation-workspace"
    );
    const editor = getDeclarations(styles, ".generation-editor");
    const lowerContents = getDeclarations(
      styles,
      ".create-page-layout > .create-lower-grid"
    );
    const parameters = getDeclarations(styles, ".generation-parameters");
    const submit = getDeclarations(styles, ".generation-submit");
    const headerHeight = Number.parseFloat(
      header.get("height") ?? header.get("min-height") ?? ""
    );
    const submitBackground = submit.get("background") ?? submit.get("background-color");

    expect(headerHeight).toBeGreaterThanOrEqual(64);
    expect(headerHeight).toBeLessThanOrEqual(72);
    expect(normalizeValue(shellBody.get("grid-template-columns"))).toContain("248px");
    expect(normalizeValue(pageLayout.get("grid-template-columns"))).toContain(
      "332px"
    );
    expect(normalizeValue(pageLayout.get("grid-template-areas"))).toContain(
      "heading parameters"
    );
    expect(normalizeValue(pageLayout.get("grid-template-areas"))).toContain(
      "recent usage"
    );
    expect(normalizeValue(workbenchContents.get("display"))).toBe("contents");
    expect(normalizeValue(workspaceContents.get("display"))).toBe("contents");
    expect(normalizeValue(lowerContents.get("display"))).toBe("contents");
    expect(normalizeValue(editor.get("grid-template-columns"))).toContain("312px");
    expect(normalizeValue(parameters.get("position"))).toBe("sticky");
    expect(normalizeValue(submit.get("width"))).toBe("100%");
    expect(normalizeValue(submitBackground)).toMatch(/var\(--primary\)|#4f46e5/);
  });

  it("uses the verified high-density Create values at 1280px and wider", () => {
    const media = getMinWidthMediaBody(styles, 1280) ?? "";
    const pageLayout = getDeclarations(media, ".create-page-layout");
    const heading = getDeclarations(
      media,
      ".create-page-layout > .create-page-heading"
    );
    const eyebrow = getDeclarations(
      media,
      ".create-page-layout .create-page-heading .eyebrow"
    );
    const title = getDeclarations(
      media,
      ".create-page-layout .create-page-heading h1"
    );
    const headingCopy = getDeclarations(
      media,
      ".create-page-layout .create-page-heading .muted"
    );
    const toolbar = getDeclarations(
      media,
      ".create-page-layout .create-toolbar"
    );
    const promptForm = getDeclarations(
      media,
      ".create-page-layout .prompt-panel form"
    );
    const prompt = getDeclarations(
      media,
      '.create-page-layout .prompt-panel textarea[rows="5"]'
    );
    const negative = getDeclarations(
      media,
      '.create-page-layout .prompt-panel textarea[rows="2"]'
    );
    const preview = getDeclarations(
      media,
      ".create-page-layout .preview-stage"
    );
    const previewImage = getDeclarations(
      media,
      ".create-page-layout .initial-preview-result img"
    );
    const parameters = getDeclarations(
      media,
      ".create-page-layout .generation-parameters"
    );

    expect(media).not.toBe("");
    expect(normalizeValue(pageLayout.get("row-gap"))).toBe("10px");
    expect(normalizeValue(heading.get("gap"))).toBe("2px");
    expect(normalizeValue(eyebrow.get("display"))).toBe("none");
    expect(normalizeValue(title.get("font-size"))).toBe("30px");
    expect(normalizeValue(headingCopy.get("max-width"))).toBe("none");
    expect(normalizeValue(toolbar.get("padding"))).toBe("10px 14px");
    expect(normalizeValue(promptForm.get("gap"))).toBe("10px");
    expect(normalizeValue(promptForm.get("margin-top"))).toBe("12px");
    expect(Number.parseFloat(prompt.get("min-height") ?? "")).toBeLessThanOrEqual(
      160
    );
    expect(Number.parseFloat(negative.get("min-height") ?? "")).toBeLessThanOrEqual(
      72
    );
    expect(Number.parseFloat(preview.get("min-height") ?? "")).toBeLessThanOrEqual(
      320
    );
    expect(Number.parseFloat(previewImage.get("max-height") ?? "")).toBeLessThanOrEqual(
      370
    );
    expect(normalizeValue(parameters.get("gap"))).toBe("10px");
  });

  it("keeps truthful full-desktop sidebar controls inside the viewport", () => {
    const media = getMinWidthMediaBody(styles, 1280) ?? "";
    const shellBody = getDeclarations(media, ".app-shell-body");
    const sidebar = getDeclarations(media, ".app-sidebar");
    const footer = getDeclarations(styles, ".sidebar-footer");

    expect(media).not.toBe("");
    expect(normalizeValue(shellBody.get("min-height"))).toContain(
      "100dvh - 68px"
    );
    expect(normalizeValue(sidebar.get("position"))).toBe("sticky");
    expect(normalizeValue(sidebar.get("top"))).toBe("68px");
    expect(normalizeValue(sidebar.get("height"))).toContain("100dvh - 68px");
    expect(normalizeValue(sidebar.get("overflow-y"))).toBe("auto");
    expect(normalizeValue(footer.get("margin-top"))).toBe("auto");
  });

  it("keeps the compact request boundary readable and touch accessible", () => {
    const summary = getDeclarations(styles, ".advanced-delivery summary");
    const hint = getDeclarations(styles, ".advanced-delivery summary small");

    expect(normalizeValue(summary.get("display"))).toBe("grid");
    expect(
      Number.parseFloat(summary.get("min-height") ?? "0")
    ).toBeGreaterThanOrEqual(44);
    expect(normalizeValue(hint.get("font-size"))).toBe("11px");
    expect(
      Number.parseFloat(hint.get("line-height") ?? "0")
    ).toBeGreaterThanOrEqual(1.2);
  });

  it("turns the sidebar into an accessible 80px icon rail at 1279px", () => {
    const media = getMediaBody(styles, 1279) ?? "";
    const shellBody = getDeclarations(media, ".app-shell-body");
    const pageLayout = getDeclarations(media, ".create-page-layout");
    const labels = getDeclarations(media, ".sidebar-nav__link span");
    const tooltip = getDeclarations(media, ".sidebar-nav__link::after");
    const workspace = getDeclarations(media, ".generation-workspace");
    const editor = getDeclarations(media, ".generation-editor");
    const parameterHeader = getDeclarations(
      media,
      ".generation-parameters .panel-header.compact"
    );
    const parameterHeading = getDeclarations(
      media,
      ".generation-parameters .panel-header.compact h2"
    );
    const parameterReset = getDeclarations(
      media,
      ".generation-parameters .panel-header.compact button"
    );

    expect(media).not.toBe("");
    expect(normalizeValue(shellBody.get("grid-template-columns"))).toContain("80px");
    expect(normalizeValue(pageLayout.get("grid-template-columns"))).toContain(
      "300px"
    );
    expect(normalizeValue(labels.get("position"))).toBe("absolute");
    expect(normalizeValue(labels.get("width"))).toBe("1px");
    expect(normalizeValue(labels.get("height"))).toBe("1px");
    expect(normalizeValue(labels.get("overflow"))).toBe("hidden");
    expect(labels.has("clip") || labels.has("clip-path")).toBe(true);
    expect(normalizeValue(tooltip.get("content"))).toBe("attr(data-label)");
    expect(normalizeValue(workspace.get("grid-template-columns"))).toContain("300px");
    expect(isSingleColumn(workspace.get("grid-template-columns"))).toBe(false);
    expect(isSingleColumn(editor.get("grid-template-columns"))).toBe(true);
    expect(normalizeValue(parameterHeader.get("gap"))).toBe("8px");
    expect(normalizeValue(parameterHeading.get("white-space"))).toBe("nowrap");
    expect(normalizeValue(parameterReset.get("white-space"))).toBe("nowrap");
    expect(normalizeValue(parameterReset.get("font-size"))).toBe("12px");
    expect(Number.parseFloat(parameterReset.get("min-height") ?? "0")).toBeGreaterThanOrEqual(44);
  });

  it("stacks the workspace and releases parameters from sticky positioning at 1023px", () => {
    const media = getMediaBody(styles, 1023) ?? "";
    const pageLayout = getDeclarations(media, ".create-page-layout");
    const workbench = getDeclarations(
      media,
      ".create-page-layout > .create-workbench"
    );
    const workspace = getDeclarations(
      media,
      ".create-page-layout .generation-workspace"
    );
    const lowerGrid = getDeclarations(
      media,
      ".create-page-layout > .create-lower-grid"
    );
    const parameters = getDeclarations(media, ".generation-parameters");

    expect(media).not.toBe("");
    expect(isSingleColumn(pageLayout.get("grid-template-columns"))).toBe(true);
    expect(normalizeValue(workbench.get("display"))).toBe("grid");
    expect(normalizeValue(workspace.get("display"))).toBe("grid");
    expect(isSingleColumn(workspace.get("grid-template-columns"))).toBe(true);
    expect(normalizeValue(lowerGrid.get("display"))).toBe("grid");
    expect(isSingleColumn(lowerGrid.get("grid-template-columns"))).toBe(true);
    expect(normalizeValue(parameters.get("position"))).toBe("static");
  });

  it("uses the mobile drawer, single-column workspace, and card tables at 767px", () => {
    const media = getMediaBody(styles, 767) ?? "";
    const shellBody = getDeclarations(media, ".app-shell-body");
    const sidebar = getDeclarations(media, ".app-sidebar");
    const menuButton = getDeclarations(media, ".mobile-menu-button");
    const backdrop = getDeclarations(media, ".mobile-nav-backdrop");
    const toolbar = getDeclarations(media, ".create-toolbar");
    const editor = getDeclarations(media, ".generation-editor");
    const settings = getDeclarations(media, ".generation-parameters .setting-stack");
    const preview = getDeclarations(media, ".preview-stage");
    const tableWrap = getDeclarations(media, ".prototype-surface .table-wrap");
    const table = getDeclarations(media, ".prototype-table");
    const tableHead = getDeclarations(media, ".prototype-table thead");
    const tableRow = getDeclarations(media, ".prototype-table tr");
    const tableCell = getDeclarations(media, ".prototype-table td");
    const providerTableWrap = getDeclarations(
      media,
      ".provider-list-card .table-wrap"
    );
    const providerTable = getDeclarations(media, ".provider-list-card table");
    const providerTableHead = getDeclarations(
      media,
      ".provider-list-card thead"
    );
    const providerTableBody = getDeclarations(
      media,
      ".provider-list-card tbody"
    );
    const providerTableRow = getDeclarations(
      media,
      ".provider-list-card tr"
    );
    const providerTableCell = getDeclarations(
      media,
      ".provider-list-card td"
    );
    const providerTableLabel = getDeclarations(
      media,
      ".provider-list-card td::before"
    );
    const appContent = getDeclarations(media, ".app-content");
    const drawerNav = getDeclarations(media, ".mobile-nav-drawer .sidebar-nav");
    const drawerNavList = getDeclarations(
      media,
      ".mobile-nav-drawer .sidebar-nav__list"
    );
    const drawerNavLink = getDeclarations(
      media,
      ".mobile-nav-drawer .sidebar-nav__link"
    );
    const drawerNavLabel = getDeclarations(
      media,
      ".mobile-nav-drawer .sidebar-nav__link span"
    );
    const drawerFooter = getDeclarations(
      media,
      ".mobile-nav-drawer .sidebar-footer"
    );
    const drawerHeaderActions = getDeclarations(
      media,
      ".mobile-nav-drawer .app-header__actions--mobile"
    );

    expect(media).not.toBe("");
    expect(isSingleColumn(shellBody.get("grid-template-columns"))).toBe(true);
    expect(normalizeValue(sidebar.get("display"))).toBe("none");
    expect(normalizeValue(menuButton.get("display"))).not.toBe("none");
    expect(normalizeValue(backdrop.get("display"))).toBe("block");
    expect(isSingleColumn(toolbar.get("grid-template-columns"))).toBe(true);
    expect(isSingleColumn(editor.get("grid-template-columns"))).toBe(true);
    expect(isSingleColumn(settings.get("grid-template-columns"))).toBe(true);
    expect(normalizeValue(preview.get("aspect-ratio"))).toBe("1");
    expect(normalizeValue(table.get("min-width"))).toBe("0");
    expect(normalizeValue(tableHead.get("position"))).toBe("absolute");
    expect(normalizeValue(tableRow.get("display"))).toBe("grid");
    expect(normalizeValue(tableCell.get("display"))).toBe("grid");
    expect(normalizeValue(tableCell.get("grid-template-columns"))).toContain("minmax");
    expect(normalizeValue(tableWrap.get("overflow"))).toBe("visible");
    expect(normalizeValue(providerTableWrap.get("overflow"))).toBe("visible");
    expect(normalizeValue(providerTable.get("display"))).toBe("block");
    expect(normalizeValue(providerTable.get("min-width"))).toBe("0");
    expect(normalizeValue(providerTableHead.get("position"))).toBe("absolute");
    expect(normalizeValue(providerTableBody.get("display"))).toBe("grid");
    expect(normalizeValue(providerTableRow.get("display"))).toBe("grid");
    expect(normalizeValue(providerTableCell.get("display"))).toBe("grid");
    expect(normalizeValue(providerTableCell.get("grid-template-columns")))
      .toContain("minmax");
    expect(normalizeValue(providerTableLabel.get("content")))
      .toBe("attr(data-label)");
    expect(normalizeValue(appContent.get("overflow-x"))).not.toBe("auto");
    expect(normalizeValue(drawerNav.get("flex"))).toBe("0 0 auto");
    expect(normalizeValue(drawerNav.get("width"))).toBe("100%");
    expect(normalizeValue(drawerNavList.get("display"))).toBe("grid");
    expect(normalizeValue(drawerNavList.get("width"))).toBe("100%");
    expect(normalizeValue(drawerNavLink.get("justify-content"))).toBe("flex-start");
    expect(normalizeValue(drawerNavLabel.get("position"))).toBe("static");
    expect(normalizeValue(drawerNavLabel.get("width"))).toBe("auto");
    expect(normalizeValue(drawerNavLabel.get("height"))).toBe("auto");
    expect(normalizeValue(drawerNavLabel.get("overflow"))).toBe("visible");
    expect(normalizeValue(drawerFooter.get("display"))).toBe("grid");
    expect(normalizeValue(drawerHeaderActions.get("width"))).toBe("100%");
    expect(normalizeValue(drawerHeaderActions.get("justify-content"))).toBe("stretch");
  });

  it("keeps menu, drawer, dialog, and primary actions at least 44px", () => {
    const menuButton = getDeclarations(styles, ".mobile-menu-button");
    const drawerClose = getDeclarations(styles, ".mobile-nav-drawer > button");
    const dialogClose = getDeclarations(styles, ".prototype-dialog > header button");
    const submit = getDeclarations(styles, ".generation-submit");
    const promptTool = getDeclarations(styles, ".prompt-tools button");
    const previewButton = getDeclarations(styles, ".preview-actions button");
    const previewLink = getDeclarations(styles, ".preview-actions a");
    const previewOverflow = getDeclarations(styles, ".preview-overflow > button");
    const prototypeTab = getDeclarations(styles, '[role="tab"]');
    const sidebarSelect = getDeclarations(styles, ".sidebar-footer__card select");
    const usageLink = getDeclarations(styles, ".todays-usage a");

    expect(Number.parseFloat(menuButton.get("min-width") ?? "0")).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(menuButton.get("min-height") ?? "0")).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(drawerClose.get("min-width") ?? "0")).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(drawerClose.get("min-height") ?? "0")).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(dialogClose.get("min-width") ?? "0")).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(dialogClose.get("min-height") ?? "0")).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(submit.get("min-height") ?? "0")).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(promptTool.get("min-height") ?? "0")).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(previewButton.get("min-height") ?? "0")).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(previewLink.get("min-height") ?? "0")).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(previewOverflow.get("min-width") ?? "0")).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(prototypeTab.get("min-height") ?? "0")).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(sidebarSelect.get("min-height") ?? "0")).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(usageLink.get("min-height") ?? "0")).toBeGreaterThanOrEqual(44);
  });

  it("keeps keyboard focus and reduced-motion behavior explicit", () => {
    expect(hasVisibleFocusRule(styles)).toBe(true);
    expect(hasReducedMotionRule(styles)).toBe(true);
  });
});
