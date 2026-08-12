import type { JsonSchemaNode } from "../aiProvider";

export type GeminiSchema = {
  type: string;
  description?: string;
  enum?: string[];
  properties?: Record<string, GeminiSchema>;
  required?: string[];
  items?: GeminiSchema;
  minItems?: string;
  maxItems?: string;
  minimum?: number;
  maximum?: number;
};

export type GeminiGenerateContentResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
};

export const toGeminiSchema = (node: JsonSchemaNode): GeminiSchema => {
  const schema: GeminiSchema = { type: node.type.toUpperCase() };

  if (node.description) {
    schema.description = node.description;
  }
  if (node.enum) {
    schema.enum = [...node.enum];
  }
  if (node.properties) {
    schema.properties = Object.fromEntries(
      Object.entries(node.properties).map(([key, value]) => [
        key,
        toGeminiSchema(value),
      ]),
    );
  }
  if (node.required) {
    schema.required = [...node.required];
  }
  if (node.items) {
    schema.items = toGeminiSchema(node.items);
  }
  if (node.minItems !== undefined) {
    schema.minItems = String(node.minItems);
  }
  if (node.maxItems !== undefined) {
    schema.maxItems = String(node.maxItems);
  }
  if (node.minimum !== undefined) {
    schema.minimum = node.minimum;
  }
  if (node.maximum !== undefined) {
    schema.maximum = node.maximum;
  }

  return schema;
};

export type GeminiTextResult = {
  text: string | null;
  finishReason: string | null;
  blockReason: string | null;
};

export const readGeminiText = (
  response: GeminiGenerateContentResponse,
): GeminiTextResult => {
  const blockReason = response.promptFeedback?.blockReason ?? null;
  const candidate = response.candidates?.[0];
  const finishReason = candidate?.finishReason ?? null;
  const parts = candidate?.content?.parts;
  const text = parts?.length
    ? parts.map((part) => part.text ?? "").join("").trim()
    : "";

  return { text: text || null, finishReason, blockReason };
};
