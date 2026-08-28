# Backlog

What is known to be missing or wrong, and what was deferred on purpose. Kept in
the open because a list of things a project does not do says more about how it
was built than a list of things it does.

Each entry names the trade-off rather than just the task. Where a decision has
been postponed, the options are written down while they are still fresh, so the
next person to pick it up — usually me, months later — starts from the reasoning
rather than from scratch.

---

## Known gaps

**Detail lookups do not fall through between sources.** `ProviderRouter.run`
treats a provider returning `null` as a successful answer, so a slug missing
from the first source never reaches the second. Items were fixed with
`runUntilFound`; spells, monsters and conditions still route through `run` and
carry the same gap, so a spell absent from dnd5eapi but present in Open5e
answers 404. The fix is mechanical: swap `run` for `runUntilFound` in the four
detail methods.

**Cold-load binding race.** Right after a page reload there is a short window
before `isAttendee` hydrates from the join acknowledgement; opening a URL for
another campaign inside that window switches the client binding. Low impact:
attendance lives in the database, a second concurrent session is impossible by a
server invariant, and returning to the live campaign re-attaches. What weakens
briefly is the lock in the interface, not the data.

**Sessions cannot be revoked.** A signed JWT is valid until it expires, so
changing a password or disabling an account does not end a session that is
already open. The only bound on the damage is the lifetime, currently one day.
The real answer is a refresh token, described below.

---

## Deferred decisions

**Refresh tokens.** A short access token with a long refresh token held in the
database, rotated on every use, which is what makes revocation possible at all.
Three things make this a feature rather than a fix, and they are the reason it
is not done yet: the rotation has to detect reuse, because a refresh token
presented twice means a copy exists somewhere and the only safe response is to
end the whole chain; the client has to funnel concurrent 401s into one shared
refresh promise, or five parallel requests trigger five rotations and four of
them look exactly like the reuse that just got defined as an attack; and expired
rows need sweeping or the table grows without bound. Worth doing, worth doing
carefully, and not worth doing badly.

**NPC sheets are player sheets.** `sheetKindFromCharacterType` collapses three
character types into two sheets: only `monster` gets the creature sheet, so an
NPC renders the full player sheet with level, XP, hit dice, death saves, spell
slots, class features and racial traits. Wrong for a tavern keeper, right for an
NPC mage. Four routes, none obviously best: a third sheet kind for NPCs with no
class machinery; route NPCs to the creature sheet, which is cheapest but drags
challenge rating along; hide the player-only sections conditionally inside the
character sheet; or ask the DM at creation time which shape they want. Related:
`characterSheetMapping.ts` hardcodes `characterClass: ""` for creature-kind
sheets, which is why the field is invisible yet required. Server-side validation
is type-aware now, but the DTO still marks `characterClass` required for every
type.

**`JsonSchemaNode` is a bag of optional fields.** In
`server/src/services/ai/providers/aiProvider.ts`: ten fields, nine optional, and
which of them are legal depends on `type` in a way the type does not express, so
`{ type: "string", minItems: 3 }` compiles. On top of that, `required` is listed
by hand on every object and duplicates the keys of `properties`, even though
every field is mandatory in all of our schemas. Either a discriminated union on
`type`, which forbids the nonsense combinations but forces the two consumers to
narrow, or constructor functions that derive `required` from `properties` and
leave the consumers alone. Deferred deliberately: with two schemas the pain is
theoretical, and the third one will show which shape the constructors actually
need.

**Structured mechanics for magic items.** The two catalogues have asymmetric
depth. Open5e v2 gear carries `weapon` and `armor` objects with damage dice,
damage type, properties, armour class and strength requirement, while v1 magic
items carry prose only. So "Weapon, +1" exposes its bonus nowhere but inside
`description`, and an enchanted weapon shows no damage dice. Two routes, neither
costed: parse the `+N` out of the text, which is cheap and brittle, or follow
Open5e's `crossreferences` field to link a magic item to its base item, which is
unverified — the field exists in v2 responses but has never been inspected.

---

## Wanted, not started

- **Combat interface polish**, for both roles. The in-fight screens have rough
  spots in the participant cards, the turn flow and which controls appear for
  whom. Needs a pass driven by complaints collected during play, not guesses.
- **Finer-grained DM permissions**: who may roll, spend and edit what, and
  whether a player's controls should lock while it is not their turn.
- **Spellcasting parsed out of the bestiary.** Open5e's Spellcasting trait would
  become seeded `spellSlots` plus per-spell abilities with
  `{ type: "spellSlot", level }` costs. Until then nothing generates
  spellSlot-cost abilities from real data, so the upcast picker can only be
  tested by hand.
- **Item inventory.** Loot is read out and written down by hand. A real
  inventory would let the loot generator write into something instead of ending
  at a card, and would give persisted generated content a reason to exist.
- **Item search.** `GET /api/srd/items` is live and unused: no browser, no
  picker. Pairs with the inventory above.
- **`cs-*` to Tailwind.** 34 legacy classes across 24 files, in the session and
  sheet clusters. Mechanical, unhurried, and best done in one pass rather than
  opportunistically.
