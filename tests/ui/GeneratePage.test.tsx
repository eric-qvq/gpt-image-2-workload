// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode
} from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import GeneratePage, { dynamic } from "../../src/app/generate/page";
import { GenerateWorkspace } from "../../src/components/generate/GenerateWorkspace";

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookies: vi.fn(),
  getAccountSummary: vi.fn(),
  getSessionFromToken: vi.fn(),
  listHistoryAssets: vi.fn(),
  listGenerationOptions: vi.fn(),
  redirect: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  usePathname: () => "/generate"
}));

vi.mock("../../src/server/auth/request-session", () => ({
  getSessionFromToken: mocks.getSessionFromToken
}));

vi.mock("../../src/server/providers/repository", () => ({
  listGenerationOptions: mocks.listGenerationOptions
}));

vi.mock("../../src/server/history/assets", () => ({
  listHistoryAssets: mocks.listHistoryAssets
}));

vi.mock("../../src/server/users/repository", () => ({
  getAccountSummary: mocks.getAccountSummary
}));

const recentAssets = [
  {
    id: "asset_copper",
    src: "/api/image-assets/asset_copper",
    prompt: "A copper robot in a greenhouse",
    providerId: "provider_1",
    modelId: "model_1",
    model: "gpt-image-2",
    createdAt: "2026-07-12T01:02:03.000Z",
    requestParams: { quality: "high" }
  }
];

type WorkspaceElementProps = {
  initialPreviewAsset?: {
    id: string;
    src: string;
    prompt: string;
  };
  initialParameters?: {
    quality?: "standard" | "high";
    responseFormat?: "url" | "b64_json";
  };
};

function findNestedWorkspace(
  node: ReactNode
): ReactElement<WorkspaceElementProps> | undefined {
  for (const child of Children.toArray(node)) {
    if (!isValidElement(child)) {
      continue;
    }

    if (child.type === GenerateWorkspace) {
      return child as ReactElement<WorkspaceElementProps>;
    }

    const nested = findNestedWorkspace(
      (child.props as { children?: ReactNode }).children
    );

    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function findWorkspaceElement(page: ReactElement) {
  const workspace = findNestedWorkspace(
    (page.props as { children?: ReactNode }).children
  );

  if (!workspace) {
    throw new Error("GenerateWorkspace element not found");
  }

  return workspace;
}

describe("GeneratePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mocks.cookieGet.mockReturnValue({ value: "session-token" });
    mocks.cookies.mockResolvedValue({ get: mocks.cookieGet });
    mocks.getSessionFromToken.mockResolvedValue({
      userId: "user_member",
      role: "MEMBER"
    });
    mocks.getAccountSummary.mockResolvedValue({
      account: "member",
      email: "member@example.com"
    });
    mocks.listGenerationOptions.mockResolvedValue({
      providers: [{ id: "provider_1", name: "Proxy" }],
      models: [
        {
          id: "model_1",
          providerId: "provider_1",
          name: "gpt-image-2",
          defaultParams: {},
          capabilities: {}
        }
      ]
    });
    mocks.listHistoryAssets.mockResolvedValue(recentAssets);
    mocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("renders the member shell once and preserves complete reuse query values", async () => {
    const { container } = render(
      await GeneratePage({
        searchParams: Promise.resolve({
          prompt: "A copper robot in a greenhouse",
          providerId: "provider_1",
          modelId: "model_1",
          size: "1536x1024",
          count: "3",
          quality: "high",
          responseFormat: "url"
        })
      })
    );

    const navigation = within(
      screen.getByRole("navigation", { name: "Primary navigation" })
    );
    const pageHeading = container.querySelector(".page-heading");

    expect(dynamic).toBe("force-dynamic");
    expect(screen.getByText("GPT Image Workbench")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Account: member" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("Proxy / gpt-image-2").length).toBeGreaterThanOrEqual(2);
    expect(navigation.getByRole("link", { name: "Create" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(
      navigation.getByRole("link", { name: "Models" })
    ).toHaveAttribute("href", "/models");
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
    expect(navigation.getAllByRole("link", { name: "History" })).toHaveLength(1);
    expect(
      within(screen.getByRole("region", { name: "Image preview" })).getByRole(
        "link",
        { name: "History" }
      )
    ).toHaveAttribute("href", "/history");
    expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument();
    expect(pageHeading).toBeInTheDocument();
    expect(
      within(pageHeading as HTMLElement).getByRole("heading", {
        name: "Create Image"
      })
    ).toBeInTheDocument();
    expect(
      within(pageHeading as HTMLElement).getByText(/Submit a prompt/)
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Prompt")).toHaveValue(
      "A copper robot in a greenhouse"
    );
    expect(screen.getByLabelText("Model")).toHaveValue("model_1");
    expect(screen.queryByLabelText("Provider")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Resolution")).toHaveValue("1536x1024");
    const quality = within(screen.getByRole("group", { name: "Quality" }));

    expect(quality.getByRole("button", { name: "High" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(quality.getByRole("button", { name: "Standard" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    fireEvent.click(screen.getByText("Advanced delivery"));
    expect(screen.getByLabelText("Count")).toHaveValue(3);
    expect(screen.getByLabelText("Delivery")).toHaveValue("url");
    expect(mocks.listGenerationOptions).toHaveBeenCalledOnce();
    expect(mocks.listHistoryAssets).toHaveBeenCalledWith(
      { userId: "user_member", role: "MEMBER" },
      { limit: 6, offset: 0 }
    );
    expect(
      screen.getAllByRole("img", { name: "A copper robot in a greenhouse" })
        .length
    ).toBeGreaterThanOrEqual(1);
    const lowerGrid = container.querySelector(".create-lower-grid");
    const createLayout = container.querySelector(".create-page-layout");

    expect(createLayout).toBeInTheDocument();
    expect(
      createLayout?.querySelector(":scope > .create-page-heading")
    ).toBe(pageHeading);
    expect(
      createLayout?.querySelector(":scope > .create-workbench")
    ).toBeInTheDocument();
    expect(
      createLayout?.querySelector(":scope > .create-lower-grid")
    ).toBe(lowerGrid);
    expect(lowerGrid).toBeInTheDocument();
    expect(
      within(lowerGrid as HTMLElement).getByRole("heading", {
        name: "Recent Generations"
      })
    ).toBeInTheDocument();
    expect(
      within(lowerGrid as HTMLElement).getByRole("heading", {
        name: "Today's Usage"
      })
    ).toBeInTheDocument();
    expect(
      within(lowerGrid as HTMLElement).getByText("Images Generated").nextSibling
    ).toHaveTextContent("—");
    expect(
      within(lowerGrid as HTMLElement).getByText("Compute Time").nextSibling
    ).toHaveTextContent("—");
    expect(lowerGrid).not.toHaveTextContent(/128 \/ 500|42m \/ 200m/);
    expect(screen.getByRole("link", { name: "View All" })).toHaveAttribute(
      "href",
      "/history"
    );
  });

  it("passes b64_json through as a supported response format", async () => {
    const page = await GeneratePage({
      searchParams: Promise.resolve({ responseFormat: "b64_json" })
    });

    expect(
      findWorkspaceElement(page).props.initialParameters?.responseFormat
    ).toBe("b64_json");

    render(page);
    fireEvent.click(screen.getByText("Advanced delivery"));
    expect(screen.getByLabelText("Delivery")).toHaveValue("b64_json");
  });

  it("uses the most recent real asset as the initial image preview", async () => {
    const page = await GeneratePage({});
    const workspace = findWorkspaceElement(page);

    expect(workspace.props.initialPreviewAsset).toMatchObject({
      id: "asset_copper",
      src: "/api/image-assets/asset_copper",
      prompt: "A copper robot in a greenhouse"
    });

    render(page);
    const preview = screen.getByRole("region", { name: "Image preview" });
    expect(
      within(preview).getByRole("img", {
        name: "A copper robot in a greenhouse"
      })
    ).toHaveAttribute("src", "/api/image-assets/asset_copper");
  });

  it("falls back to the workspace response format for an unsupported query value", async () => {
    const page = await GeneratePage({
      searchParams: Promise.resolve({ responseFormat: "raw" })
    });

    expect(
      findWorkspaceElement(page).props.initialParameters?.responseFormat
    ).toBeUndefined();

    render(page);

    fireEvent.click(screen.getByText("Advanced delivery"));
    expect(screen.getByLabelText("Delivery")).toHaveValue("b64_json");
  });

  it("falls back to Standard for an unsupported quality query value", async () => {
    const page = await GeneratePage({
      searchParams: Promise.resolve({ quality: "ultra" })
    });

    expect(findWorkspaceElement(page).props.initialParameters?.quality).toBeUndefined();

    render(page);
    expect(screen.getByRole("button", { name: "Standard" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Ultra" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("redirects to login when the member session is missing", async () => {
    mocks.cookieGet.mockReturnValue(undefined);
    mocks.getSessionFromToken.mockResolvedValue(null);

    await expect(
      Promise.resolve().then(() => GeneratePage({}))
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.cookieGet).toHaveBeenCalledWith("session");
    expect(mocks.getSessionFromToken).toHaveBeenCalledWith(undefined);
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
    expect(mocks.listGenerationOptions).not.toHaveBeenCalled();
    expect(mocks.listHistoryAssets).not.toHaveBeenCalled();
  });

  it("keeps the workspace available when provider options cannot be loaded", async () => {
    mocks.listGenerationOptions.mockRejectedValue(new Error("database offline"));

    render(await GeneratePage({}));

    expect(screen.getByLabelText("Prompt")).toHaveValue("");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No enabled provider found"
    );
    expect(
      screen.getByRole("button", { name: "Generate image" })
    ).toBeDisabled();
    expect(
      within(screen.getByRole("region", { name: "Image preview" })).getByRole(
        "img",
        { name: "A copper robot in a greenhouse" }
      )
    ).toHaveAttribute("src", "/api/image-assets/asset_copper");
  });

  it("renders an empty recent section when no history exists", async () => {
    mocks.listHistoryAssets.mockResolvedValue([]);

    render(await GeneratePage({}));

    expect(screen.getByText("No generated images yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View All" })).toHaveAttribute(
      "href",
      "/history"
    );
  });

  it("switches the complete Create workspace to Chinese", async () => {
    render(await GeneratePage({}));

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "zh" }
    });

    expect(
      screen.getByRole("heading", { name: "创建图像", level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "提示词" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "图像预览" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "参数" })).toBeInTheDocument();
    expect(screen.getByLabelText("模型")).toHaveValue("model_1");
    expect(screen.getByLabelText("分辨率")).toHaveValue("1024x1024");
    expect(screen.getByRole("button", { name: "生成图像" })).toBeEnabled();
    expect(screen.getAllByText("Proxy / gpt-image-2").length)
      .toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("A copper robot in a greenhouse").length)
      .toBeGreaterThanOrEqual(1);
  });

  it("keeps provider options when recent history cannot be loaded", async () => {
    mocks.listHistoryAssets.mockRejectedValue(new Error("history offline"));

    render(await GeneratePage({}));

    expect(screen.getByLabelText("Model")).toHaveValue("model_1");
    expect(
      screen.getByRole("button", { name: "Generate image" })
    ).toBeEnabled();
    expect(screen.getByText("No generated images yet.")).toBeInTheDocument();
  });
});
