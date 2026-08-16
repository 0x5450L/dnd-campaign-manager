import prisma from "../services/prisma";

const databaseNameFromUrl = (url: string): string =>
  new URL(url).pathname.replace(/^\//, "");

export const assertDisposableDatabase = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set; integration tests need .env.test");
  }

  const database = databaseNameFromUrl(url);
  if (!/test/i.test(database)) {
    throw new Error(
      `Refusing to wipe database "${database}": integration tests only run against a database whose name contains "test"`,
    );
  }
};

export const resetDatabase = async () => {
  assertDisposableDatabase();

  const tables: { tablename: string }[] = await prisma.$queryRaw`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;

  if (tables.length === 0) return;

  const targets = tables.map((table) => `"public"."${table.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${targets} RESTART IDENTITY CASCADE`);
};
