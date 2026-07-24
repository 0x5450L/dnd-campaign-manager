import type { AiProviderId } from "@shared/dto/ai";

export type JsonSchemaType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "integer"
  | "boolean";

export type JsonSchemaNode = {
  type: JsonSchemaType;
  description?: string;
  enum?: readonly string[];
  properties?: Record<string, JsonSchemaNode>;
  required?: readonly string[];
  items?: JsonSchemaNode;
  minItems?: number;
  maxItems?: number;
};

export type StructuredTextRequest = {
  systemPrompt: string;
  userPrompt: string;
  responseSchema: JsonSchemaNode;
  temperature?: number;
  maxOutputTokens?: number;
};

export type StructuredTextResult = {
  data: unknown;
  model: string;
};

export interface TextProvider {
  readonly id: AiProviderId;
  generateStructured(
    request: StructuredTextRequest,
  ): Promise<StructuredTextResult>;
}
