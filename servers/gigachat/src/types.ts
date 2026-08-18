export interface OAuthTokenResponse {
  access_token: string;
  expires_at: number;
}

export interface GigaChatModel {
  id: string;
  object: string;
  owned_by: string;
}

export interface GigaChatModelsResponse {
  object: string;
  data: GigaChatModel[];
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  n?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionChoice {
  message: ChatMessage;
  index: number;
  finish_reason: string;
}

export interface ChatCompletionResponse {
  choices: ChatCompletionChoice[];
  created: number;
  model: string;
  object: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export interface EmbeddingsRequest {
  model: string;
  input: string[];
}

export interface EmbeddingData {
  object: string;
  embedding: number[];
  index: number;
}

export interface EmbeddingsResponse {
  object: string;
  data: EmbeddingData[];
  model: string;
}

export interface TokenCountResponse {
  tokens: number;
  characters: number;
}

export interface BalanceResponse {
  balance: Array<{ usage: string; value: number }>;
}

export interface FileUploadResponse {
  id: string;
  object: string;
  bytes: number;
  created_at: number;
  filename: string;
  purpose: string;
}
