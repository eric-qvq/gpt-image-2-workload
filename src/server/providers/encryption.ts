import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function resolveEncryptionKey(key = process.env.ENCRYPTION_KEY): Buffer {
  if (!key) {
    throw new Error("ENCRYPTION_KEY is required");
  }

  const decoded = Buffer.from(key, "base64");
  if (decoded.length !== 32) {
    throw new Error("ENCRYPTION_KEY must decode to 32 bytes");
  }

  return decoded;
}

export function encryptApiKey(apiKey: string, key?: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", resolveEncryptionKey(key), iv, {
    authTagLength: AUTH_TAG_LENGTH
  });
  const ciphertext = Buffer.concat([
    cipher.update(apiKey, "utf8"),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, ciphertext]
    .map((part) => part.toString("base64"))
    .join(".");
}

export function decryptApiKey(encrypted: string, key?: string): string {
  const [iv, authTag, ciphertext] = encrypted
    .split(".")
    .map((part) => Buffer.from(part, "base64"));

  if (!iv || !authTag || !ciphertext) {
    throw new Error("Invalid encrypted API key");
  }

  const decipher = createDecipheriv("aes-256-gcm", resolveEncryptionKey(key), iv, {
    authTagLength: AUTH_TAG_LENGTH
  });
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString("utf8");
}
