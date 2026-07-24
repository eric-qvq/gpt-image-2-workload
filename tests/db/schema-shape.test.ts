import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Prisma schema", () => {
  it("defines the MVP persistence models", () => {
    const schema = readFileSync("prisma/schema.prisma", "utf8");
    for (const model of ["User", "Provider", "ImageModel", "Conversation", "Message", "GenerationJob", "ImageAsset"]) {
      expect(schema).toContain(`model ${model}`);
    }
  });
});
