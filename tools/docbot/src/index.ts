import fs from "node:fs/promises";
import path from "node:path";
import Handlebars from "handlebars";
import { scanCSharpControllers } from "./scanners/csharp.js";
import { scanAngularComponents } from "./scanners/angular.js";
import { globby } from "globby";

const cfgPath = path.resolve(process.cwd(), "docbot.config.json");
const cfg = JSON.parse(await fs.readFile("docbot.config.json", "utf-8"));

const repoRoot = path.resolve(process.cwd(), "..", ".."); // tools/docbot -> repo root
const outputDir = path.resolve(process.cwd(), cfg.outputDir || "../../docs");

// helpers
async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}
async function readTemplate(name: string) {
  const p = path.join(process.cwd(), "src", "templates", name);
  return Handlebars.compile(await fs.readFile(p, "utf8"));
}
async function writeIfChanged(filePath: string, content: string) {
  try {
    const old = await fs.readFile(filePath, "utf8");
    if (old === content) return false;
  } catch { /* no existe */ }
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
  return true;
}

await ensureDir(outputDir);
const controllerTpl = await readTemplate("controller.md.hbs");
const componentTpl = await readTemplate("component.md.hbs");

// SCAN BACKEND
const backRoot = repoRoot;
const controllers = await scanCSharpControllers(backRoot);
let anyChanged = false;
for (const c of controllers) {
  const desc = cfg.useLLM ? "(explicación IA)" : "(sin explicación IA)";
  const md = controllerTpl({ ...c, description: desc });
  const fileOut = path.join(outputDir, "backend", "controllers", `${c.name}.md`);
  if (await writeIfChanged(fileOut, md)) anyChanged = true;
}

// SCAN FRONTEND
const frontRoot = repoRoot;
const components = await scanAngularComponents(frontRoot);
for (const cmp of components) {
  const desc = cfg.useLLM ? "(explicación IA)" : "(sin explicación IA)";
  const md = componentTpl({ ...cmp, description: desc });
  const fileOut = path.join(outputDir, "frontend", "components", `${cmp.name}.md`);
  if (await writeIfChanged(fileOut, md)) anyChanged = true;
}

// SUMMARY simple
const summaryLines = ["# Índice", ""];
if (controllers.length) {
  summaryLines.push("## Backend - Controllers");
  controllers.forEach(c => summaryLines.push(`- [${c.name}](backend/controllers/${encodeURIComponent(c.name)}.md)`));
}
if (components.length) {
  summaryLines.push("");
  summaryLines.push("## Frontend - Componentes");
  components.forEach(c => summaryLines.push(`- [${c.name}](frontend/components/${encodeURIComponent(c.name)}.md)`));
}
const summaryPath = path.join(outputDir, "SUMMARY.md");
if (await writeIfChanged(summaryPath, summaryLines.join("\n"))) anyChanged = true;

console.log("DocBot: generado. Cambios:", anyChanged);
if (!anyChanged) process.exit(0);
