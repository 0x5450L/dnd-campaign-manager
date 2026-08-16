import { execSync } from "node:child_process";

export default () => {
  execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
};
