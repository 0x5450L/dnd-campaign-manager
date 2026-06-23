import type { SrdCategory } from "../../../../shared/srd";

export interface ReferenceStore {
  readDetail<TDetail>(
    category: SrdCategory,
    slug: string,
  ): Promise<TDetail | null>;
}

export class NullReferenceStore implements ReferenceStore {
  async readDetail<TDetail>(): Promise<TDetail | null> {
    return null;
  }
}
