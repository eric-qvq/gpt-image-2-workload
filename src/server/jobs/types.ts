export type GenerationJobInput = {
  userId: string;
  conversationId: string;
  messageId?: string | null;
  providerId: string;
  modelId: string;
  prompt: string;
  requestParams: Record<string, unknown>;
};
