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

  return schema;
};

export const readGeminiText = (
  response: GeminiGenerateContentResponse,
): string | null => {
  const blockReason = response.promptFeedback?.blockReason;
  if (blockReason) {
    return null;
  }
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts?.length) {
    return null;
  }
  const text = parts.map((part) => part.text ?? "").join("").trim();
  return text || null;
};
