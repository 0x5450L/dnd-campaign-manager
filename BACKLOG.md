# Backlog

## Bugs / known gaps

- **Detail lookups do not fall through between sources.** `ProviderRouter.run` treats a provider returning `null` as a successful answer, so a slug missing from the first source never reaches the second. Fixed for items via `runUntilFound`; spells, monsters and conditions still route through `run` and carry the same gap — a spell absent from dnd5eapi but present in Open5e answers 404. Fix is mechanical: swap `run` for `runUntilFound` in the four detail methods.
- **Cold-load binding race (low impact).** Right after a page reload there is a short window before `isAttendee` hydrates from the join ack; a direct URL to another campaign during that window switches the client binding. Harmless now: attendance lives in the DB, the second session is impossible (server invariant), and returning to the live campaign re-attaches — but the lock UX briefly weakens.

## Features / improvements

- **NPC sheet is the player sheet.** `sheetKindFromCharacterType` collapses three character types into two sheets — only `monster` gets the creature sheet, so an NPC renders the full player sheet with level, XP, hit dice, death saves, spell slots, class features and racial traits. Wrong for a tavern keeper, right for an NPC mage. Options: a third `SheetKind` "npc" (lore + stats + HP/AC + attacks + notes, no class machinery), route NPCs to the creature sheet (cheapest, but drags CR along), hide player-only sections conditionally inside the character sheet, or ask the DM at creation time which shape they want. Related: `characterSheetMapping.ts` hardcodes `characterClass: ""` for creature-kind sheets, which is why the field is invisible yet required — server-side validation is now type-aware, but the DTO still marks `characterClass` required for every type.

- **`JsonSchemaNode` is a bag of optional fields.** `server/src/services/ai/providers/aiProvider.ts`: ten fields, nine optional, the legality of each depends on `type`, and the type does not express that — `{ type: "string", minItems: 3 }` compiles. On top of that `required` is listed by hand on every object and duplicates the keys of `properties`, even though every field is mandatory in all our schemas. Options: a discriminated union on `type` (forbids nonsense combinations, but the two consumers — the Gemini mapper and the mock provider — walk the node and would have to narrow), constructor functions `jsonObject` / `jsonArray` / `jsonString` / `jsonInteger` with `required` derived from `properties` (kills the duplication, leaves consumers alone), or both. Deferred: with two schemas the pain is theoretical. Revisit before the next AI feature adds a third, which will show which shape the constructors actually need.

- **Combat UI polish for both DM and player.** Current in-fight screens have rough spots (participant cards, turn flow, visibility of controls per role). Needs a dedicated pass with concrete complaints collected during playtesting.
- **DM permissions patch:** who can roll/spend/edit what, locks on player actions during another turn.
- **Bestiary Spellcasting parsing:** parse the Open5e Spellcasting trait into seeded `spellSlots` plus per-spell abilities with `{ type: "spellSlot", level }` costs. Until then nothing generates spellSlot-cost abilities, so the upcast level picker is untestable in real data.
- **`cs-*` → Tailwind migration:** 34 legacy classes across 24 files (session/campaign cluster + sheets cluster). Postponed until after release.
- **Structured mechanics for magic items.** The two item catalogues have asymmetric depth: Open5e v2 gear carries `weapon`/`armor` objects (damage dice, damage type, properties, AC, strength requirement), while Open5e v1 magic items carry prose only. So "Weapon, +1" exposes its bonus nowhere but inside `description`, and an enchanted weapon shows no damage dice. Two routes, neither costed yet: parse `+N` out of the text (cheap, brittle), or follow Open5e's `crossreferences` field to link a magic item to its base item (unverified — the field exists in v2 responses but was never inspected). Until then the DM reads the rules text.
- **Item inventory.** Loot is read out and written down by hand. A real inventory (Prisma model, CRUD, per-character UI) would let the loot generator write into a form instead of ending at a card, and would give `GeneratedContent` persistence a reason to exist.
- **Item search UI.** `GET /api/srd/items` is live and unused: no browser, no picker. Would pair with inventory and give the bestiary an equipment sibling.

## Release checklist

- Auth cookie: `secure: false`, `sameSite: "lax"` — revisit for production; CORS origin is hardcoded to `http://localhost:5173` in two places.
- Zod schemas have no max-length caps on strings/arrays (DoS surface beyond the default 100kb body limit).
- README / deployment notes.

## Infra (after release)

- **npm workspaces + `@dnd/shared` package** (alias variant В): removes the `rootDir: ".."` hack and `tsconfig-paths`/`tsc-alias` runtime machinery; `@shared/*` specifiers become `@dnd/shared/*` mechanically.
- `.git-blame-ignore-revs` for the mechanical alias-rewrite commit.
