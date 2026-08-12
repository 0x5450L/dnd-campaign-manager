import { getReferenceService } from "../reference";
import { AiService } from "./aiService";
import { readAiConfig, type AiConfig } from "./config";
import { EncounterGenerator } from "./generators/encounterGenerator";
import { LootGenerator } from "./generators/lootGenerator";
import { createTextProvider } from "./providers/providerRouter";

let instance: AiService | null = null;
let config: AiConfig | null = null;

export function getAiConfig(): AiConfig {
  if (!config) {
    config = readAiConfig();
  }
  return config;
}

export function getAiService(): AiService {
  if (!instance) {
    const provider = createTextProvider(getAiConfig());
    instance = new AiService(
      provider,
      new LootGenerator(provider, getReferenceService()),
      new EncounterGenerator(provider, getReferenceService()),
    );
  }
  return instance;
}

export { AiService } from "./aiService";
