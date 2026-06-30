import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import * as yaml from "js-yaml";
import { env } from "./env.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const specPath = join(__dirname, "../../docs/openapi.yaml");

export function setupSwagger(app: Express): void {
  if (env.NODE_ENV === "production") {
    return;
  }

  let spec: Record<string, unknown> | undefined;

  try {
    if (!existsSync(specPath)) {
      throw new Error(`Swagger spec not found at ${specPath}`);
    }
    const raw = readFileSync(specPath, "utf-8");
    spec = yaml.load(raw) as Record<string, unknown>;
  } catch (err) {
    console.warn(
      "[swagger] Failed to load OpenAPI spec — skipping /api-docs setup.",
      err instanceof Error ? err.message : String(err),
    );
    return;
  }

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
}
