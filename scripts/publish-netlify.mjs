import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ID = "b7183b3a-4085-4730-9f56-3b1efe156f59";
const PRODUCTION = "https://lupulos-frontend.netlify.app";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COPY = "/tmp/lupulos-frontend-prod";

if (process.argv.includes("--no-build")) {
  console.error("Ese modo publica la carpeta sin el CSS y el JavaScript de Next. Usa npm run deploy:netlify.");
  process.exit(1);
}

function run(command, args, { cwd = ROOT, capture = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, CI: "1" },
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let stdout = "";
    let stderr = "";
    if (capture) {
      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });
    }
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

function parseJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("La respuesta de Netlify no trae JSON.");
  return JSON.parse(text.slice(start, end + 1));
}

async function currentDeployId() {
  const result = await run(
    "netlify",
    ["api", "getSite", "--data", JSON.stringify({ site_id: SITE_ID })],
    { capture: true },
  );
  if (result.code !== 0) {
    throw new Error(result.stderr || "No pude leer el deploy publicado.");
  }
  return parseJson(result.stdout).published_deploy?.id ?? null;
}

async function restore(deployId) {
  console.error(`La verificación falló. Vuelvo a publicar ${deployId}.`);
  const result = await run(
    "netlify",
    ["api", "restoreSiteDeploy", "--data", JSON.stringify({ site_id: SITE_ID, deploy_id: deployId })],
    { capture: true },
  );
  if (result.code !== 0) {
    throw new Error(result.stderr || "No pude restaurar el deploy anterior.");
  }
}

async function verifyProduction() {
  const response = await fetch(`${PRODUCTION}/?verify=${Date.now()}`, {
    headers: { Accept: "text/html", "Cache-Control": "no-cache" },
  });
  const html = await response.text();
  if (response.status !== 200) return `inicio respondió ${response.status}`;
  if (!html.includes("#080610") || !html.includes("Iniciar sesión")) {
    return "el inicio no es la interfaz de la comunidad";
  }
  if (html.includes("registro de la cerveza") || html.includes("Internal Server Error")) {
    return "el inicio publicó otra pantalla";
  }
  const assets = [...new Set(html.match(/\/_next\/static\/[^"\\]+/g) ?? [])];
  if (assets.length < 5) return "el HTML no referencia los archivos de Next";
  for (const asset of assets) {
    const assetResponse = await fetch(PRODUCTION + asset, { method: "HEAD" });
    if (assetResponse.status !== 200) return `${asset} respondió ${assetResponse.status}`;
  }
  return null;
}

const previousId = await currentDeployId();
console.log(`Deploy actual: ${previousId ?? "ninguno"}`);

await run("rm", ["-rf", COPY]);
const synced = await run("rsync", [
  "-a",
  "--exclude",
  "node_modules",
  "--exclude",
  ".next",
  "--exclude",
  ".git",
  `${ROOT}/`,
  `${COPY}/`,
]);
if (synced.code !== 0) process.exit(synced.code);

const copied = await run("cp", ["-a", path.join(ROOT, "node_modules"), path.join(COPY, "node_modules")]);
if (copied.code !== 0 && !existsSync(path.join(COPY, "node_modules/next/dist/server/lib/start-server.js"))) {
  console.error("La copia de node_modules no incluye Next.");
  process.exit(copied.code || 1);
}

const deployed = await run(
  "netlify",
  ["deploy", "--prod", "--build", "--skip-functions-cache", "--site", SITE_ID],
  { cwd: COPY, capture: true },
);
process.stdout.write(deployed.stdout);
process.stderr.write(deployed.stderr);
const deployLog = `${deployed.stdout}\n${deployed.stderr}`;

const deployPath = deployLog.match(/Deploy path:\s+(\S+)/)?.[1] ?? "";
const publishedNext = deployPath.endsWith("/.next") || deployPath.endsWith(".next");
const wentLive = deployLog.includes("Deploy is live");
if (deployed.code !== 0 || !publishedNext) {
  console.error(publishedNext ? "El build falló y el sitio anterior sigue publicado." : `Deploy path inesperado: ${deployPath || "vacío"}`);
  if (!publishedNext && wentLive && previousId) await restore(previousId);
  process.exit(1);
}

const problem = await verifyProduction();
if (problem) {
  if (previousId) await restore(previousId);
  console.error(problem);
  process.exit(1);
}

await run("rm", ["-rf", COPY]);
console.log("Producción verificada: estilos, scripts y la interfaz de la comunidad.");
