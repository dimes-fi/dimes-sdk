import fs from "node:fs";
import path from "node:path";
import openapiTS, { astToString } from "openapi-typescript";

const source = process.env.OPENAPI_URL ?? "http://localhost:3001/v1/customer-docs-json";

const outputPath = path.resolve(import.meta.dirname, "../src/types/generated.ts");

async function main() {
  let ast;
  try {
    ast = await openapiTS(new URL(source));
  } catch (err) {
    console.error(`Failed to load OpenAPI spec from: ${source}`);
    console.error("Make sure the API is running (default: http://localhost:3001), or set OPENAPI_URL.");
    console.error(err);
    process.exit(1);
  }
  const output = astToString(ast);

  const header = [
    "// This file is auto-generated from customer-openapi.json — DO NOT EDIT",
    "// Regenerate with: pnpm run generate:types",
    "",
  ].join("\n");

  fs.writeFileSync(outputPath, header + output, "utf-8");
  console.log(`Generated types written to: ${outputPath}`);
}

main();
