import { mkdir, writeFile } from "node:fs/promises";

const markers = [
  ["./dist/cjs", { type: "commonjs" }],
  ["./dist/esm", { type: "module" }],
];

await Promise.all(
  markers.map(async ([dir, body]) => {
    await mkdir(dir, { recursive: true });
    await writeFile(`${dir}/package.json`, `${JSON.stringify(body, null, 2)}\n`);
  }),
);
