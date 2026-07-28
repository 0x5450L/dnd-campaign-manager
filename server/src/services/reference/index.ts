import { createCacheStore } from "./cache/createCacheStore";
import { Dnd5eApiProvider } from "./providers/dnd5eApiProvider";
import { Open5eProvider } from "./providers/open5eProvider";
import { Open5eV2Provider } from "./providers/open5eV2Provider";
import { ProviderRouter } from "./providers/providerRouter";
import { ReferenceService } from "./referenceService";
import { NullReferenceStore } from "./referenceStore";

let instance: ReferenceService | null = null;

export function getReferenceService(): ReferenceService {
  if (!instance) {
    const router = new ProviderRouter([
      new Dnd5eApiProvider(),
      new Open5eProvider(),
      new Open5eV2Provider(),
    ]);
    instance = new ReferenceService(
      router,
      createCacheStore(),
      new NullReferenceStore(),
    );
  }
  return instance;
}

export { ReferenceService } from "./referenceService";
export { ProviderRouter } from "./providers/providerRouter";
