import { z } from "zod";

import { prisma } from "../db/client";
import { encryptApiKey } from "./encryption";

const providerTypeSchema = z.enum([
  "OPENAI_OFFICIAL",
  "OPENAI_COMPATIBLE",
  "CUSTOM_HTTP"
]);

const providerInputSchema = z.object({
  name: z.string().trim().min(1),
  type: providerTypeSchema,
  baseUrl: z.string().trim().url(),
  apiKey: z.string().min(1),
  enabled: z.boolean().default(true)
});

const modelInputSchema = z.object({
  name: z.string().trim().min(1),
  defaultParams: z.record(z.unknown()).default({}),
  capabilities: z.record(z.unknown()).default({}),
  enabled: z.boolean().default(true)
});

type ProviderRecord = {
  id: string;
  name: string;
  type: "OPENAI_OFFICIAL" | "OPENAI_COMPATIBLE" | "CUSTOM_HTTP";
  baseUrl: string;
  encryptedApiKey: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ModelRecord = {
  id: string;
  providerId: string;
  name: string;
  defaultParams: unknown;
  capabilities: unknown;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ProviderDb = {
  provider: {
    create(args: { data: Omit<ProviderRecord, "id" | "createdAt" | "updatedAt"> }): Promise<ProviderRecord>;
    findMany(args?: { orderBy?: { createdAt: "asc" | "desc" } }): Promise<ProviderRecord[]>;
  };
  imageModel: {
    create(args: { data: Omit<ModelRecord, "id" | "createdAt" | "updatedAt"> }): Promise<ModelRecord>;
    findMany(args: {
      where: { providerId: string };
      orderBy?: { createdAt: "asc" | "desc" };
    }): Promise<ModelRecord[]>;
  };
};

type RepositoryContext = {
  db?: ProviderDb;
  encryptionKey?: string;
};

type ProviderInput = z.infer<typeof providerInputSchema>;
type ModelInput = z.infer<typeof modelInputSchema>;

function resolveDb(db?: ProviderDb): ProviderDb {
  return (db ?? prisma) as ProviderDb;
}

function withoutEncryptedApiKey(provider: ProviderRecord) {
  const { encryptedApiKey: _encryptedApiKey, ...safeProvider } = provider;
  return safeProvider;
}

export async function createProvider(
  input: ProviderInput,
  context: RepositoryContext = {}
) {
  const data = providerInputSchema.parse(input);
  const provider = await resolveDb(context.db).provider.create({
    data: {
      name: data.name,
      type: data.type,
      baseUrl: data.baseUrl,
      encryptedApiKey: encryptApiKey(data.apiKey, context.encryptionKey),
      enabled: data.enabled
    }
  });

  return withoutEncryptedApiKey(provider);
}

export async function listProviders(context: Pick<RepositoryContext, "db"> = {}) {
  const providers = await resolveDb(context.db).provider.findMany({
    orderBy: { createdAt: "desc" }
  });

  return providers.map(withoutEncryptedApiKey);
}

export async function createModel(
  providerId: string,
  input: ModelInput,
  context: Pick<RepositoryContext, "db"> = {}
) {
  const data = modelInputSchema.parse(input);

  return resolveDb(context.db).imageModel.create({
    data: {
      providerId,
      name: data.name,
      defaultParams: data.defaultParams,
      capabilities: data.capabilities,
      enabled: data.enabled
    }
  });
}

export async function listModelsForProvider(
  providerId: string,
  context: Pick<RepositoryContext, "db"> = {}
) {
  return resolveDb(context.db).imageModel.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" }
  });
}
