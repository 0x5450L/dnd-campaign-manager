import { AI_PROVIDER_ID } from "@shared/constants/ai";
import type { AiProviderId } from "@shared/dto/ai";
import type {
  JsonSchemaNode,
  StructuredTextRequest,
  StructuredTextResult,
  TextProvider,
} from "./aiProvider";

const MOCK_MODEL = "mock-loremaster";
const MOCK_LATENCY_MS = 450;

const FLAVOUR_WORDS = [
  "Ashen",
  "Whispering",
  "Gilded",
  "Hollow",
  "Sundered",
  "Emberbound",
  "Moonlit",
  "Rusted",
];

const NOUN_WORDS = [
  "Sigil",
  "Locket",
  "Blade",
  "Censer",
  "Coffer",
  "Tome",
  "Chalice",
  "Key",
];

const SENTENCES = [
  "Dust lifts from the find as the lantern light reaches it, and something inside catches the glow.",
  "The hoard has clearly been picked over once already, but whoever came first was in a hurry.",
  "Beneath a fold of rotted cloth the party turns up a small collection of things worth carrying.",
];

export class MockTextProvider implements TextProvider {
  readonly id: AiProviderId = AI_PROVIDER_ID.Mock;
  private counter = 0;

  async generateStructured(
    request: StructuredTextRequest,
  ): Promise<StructuredTextResult> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
    return {
      data: this.buildValue(request.responseSchema, ""),
      model: MOCK_MODEL,
    };
  }

  private buildValue(node: JsonSchemaNode, key: string): unknown {
    switch (node.type) {
      case "object":
        return Object.fromEntries(
          Object.entries(node.properties ?? {}).map(([childKey, child]) => [
            childKey,
            this.buildValue(child, childKey),
          ]),
        );
      case "array": {
        const length = node.minItems ?? 3;
        const items = node.items;
        if (!items) {
          return [];
        }
        return Array.from({ length }, () => this.buildValue(items, key));
      }
      case "string":
        return node.enum?.length
          ? node.enum[this.next() % node.enum.length]
          : this.buildText(key);
      case "integer":
      case "number":
        return this.next();
      case "boolean":
        return this.next() % 2 === 0;
    }
  }

  private buildText(key: string): string {
    if (key === "name") {
      return `${this.pick(FLAVOUR_WORDS)} ${this.pick(NOUN_WORDS)}`;
    }
    if (key === "readAloud") {
      return `${this.pick(SENTENCES)} ${this.pick(SENTENCES)}`;
    }
    return `Mock text for ${key || "value"} — no AI provider is configured, so this is placeholder content.`;
  }

  private pick(pool: readonly string[]): string {
    return pool[this.next() % pool.length];
  }

  private next(): number {
    this.counter += 1;
    return this.counter * 7 + Math.floor(Math.random() * 3);
  }
}
