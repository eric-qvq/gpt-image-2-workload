// @vitest-environment node

import { describe, expect, it } from "vitest";

import { decryptApiKey, encryptApiKey } from "../../src/server/providers/encryption";

const key = Buffer.from("0123456789abcdef0123456789abcdef").toString("base64");

describe("provider API key encryption", () => {
  it("encrypts API keys without storing plain text and decrypts them", () => {
    const encrypted = encryptApiKey("sk-test-key", key);

    expect(encrypted).not.toBe("sk-test-key");
    expect(encrypted.split(".")).toHaveLength(3);
    expect(decryptApiKey(encrypted, key)).toBe("sk-test-key");
  });
});
