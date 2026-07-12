UPDATE "characters" c
SET "abilities" = COALESCE(c."abilities", '[]'::jsonb) || converted.new_abilities
FROM (
  SELECT cp."character_id" AS character_id,
         jsonb_agg(
           jsonb_build_object(
             'id', ct."id",
             'name', ct."name",
             'description', ct."description",
             'activation', CASE ct."kind"::text WHEN 'legendary_action' THEN 'legendary' ELSE 'passive' END,
             'cost', CASE ct."kind"::text WHEN 'legendary_action' THEN jsonb_build_object('type', 'pool', 'pool', 'legendary', 'amount', 1) ELSE NULL END
           )
         ) AS new_abilities
  FROM "creature_traits" ct
  JOIN "creature_profiles" cp ON cp."id" = ct."profile_id"
  GROUP BY cp."character_id"
) converted
WHERE c."id" = converted.character_id;

UPDATE "characters" c
SET "resources" = COALESCE(c."resources", '[]'::jsonb) ||
  '[{"key":"legendary","label":"Legendary Actions","max":3,"remaining":3,"resetOn":"turn"}]'::jsonb
WHERE EXISTS (
  SELECT 1
  FROM "creature_traits" ct
  JOIN "creature_profiles" cp ON cp."id" = ct."profile_id"
  WHERE cp."character_id" = c."id" AND ct."kind"::text = 'legendary_action'
)
AND NOT EXISTS (
  SELECT 1 FROM jsonb_array_elements(COALESCE(c."resources", '[]'::jsonb)) pool
  WHERE pool->>'key' = 'legendary'
);

DROP TABLE "creature_traits";

DROP TYPE "CreatureTraitKind";
