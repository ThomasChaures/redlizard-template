#!/usr/bin/env node
import { cp, mkdir, readFile, writeFile, rename, readdir, stat, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, basename } from "node:path";
import { spawnSync } from "node:child_process";
import {
  intro,
  outro,
  text,
  select,
  confirm,
  spinner,
  isCancel,
  cancel,
  note,
  log,
} from "@clack/prompts";
import pc from "picocolors";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Tras el build, dist/ y template/ son hermanos dentro del paquete publicado.
const TEMPLATE_DIR = resolve(__dirname, "../template");

// Archivos del template que viajan con prefijo "_" para no romper npm/git al publicar.
const RENAME_MAP: Record<string, string> = {
  "_gitignore": ".gitignore",
  "_env.example": ".env.example",
  "_package.json": "package.json",
  "_mcp.json": ".mcp.json",
  "_npmrc": ".npmrc",
};

type PkgManager = "npm" | "pnpm" | "yarn" | "bun";
type CiProvider = "github" | "bitbucket" | "gitlab" | "none";

function onCancel(): never {
  cancel("Operación cancelada.");
  process.exit(0);
}

function unwrap<T>(value: T | symbol): T {
  if (isCancel(value)) onCancel();
  return value as T;
}

function isValidProjectName(name: string): boolean {
  return /^[a-z0-9][a-z0-9-_]*$/.test(name);
}

async function copyTemplate(
  targetDir: string,
  projectName: string,
  ci: CiProvider,
): Promise<void> {
  await cp(TEMPLATE_DIR, targetDir, { recursive: true });

  // Aplicar el preset de CI elegido y descartar la carpeta de presets.
  const presetsDir = join(targetDir, "_ci-presets");
  if (ci !== "none") {
    const chosen = join(presetsDir, ci);
    if (existsSync(chosen)) {
      await cp(chosen, targetDir, { recursive: true });
    }
  }
  await rm(presetsDir, { recursive: true, force: true });

  await renameAndReplace(targetDir, projectName);
}

// Recorre el árbol copiado, renombra los archivos "_*" y reemplaza placeholders.
async function renameAndReplace(dir: string, projectName: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      await renameAndReplace(fullPath, projectName);
      continue;
    }
    // Renombrar si corresponde.
    let finalPath = fullPath;
    const mapped = RENAME_MAP[entry.name];
    if (mapped) {
      finalPath = join(dir, mapped);
      await rename(fullPath, finalPath);
    }
    // Reemplazar placeholders sólo en archivos de texto.
    if (/\.(json|ts|tsx|js|jsx|css|md|sql|toml|env|example|txt|yml|yaml|html)$/i.test(finalPath) || basename(finalPath).startsWith(".")) {
      try {
        const content = await readFile(finalPath, "utf8");
        if (content.includes("{{PROJECT_NAME}}")) {
          await writeFile(finalPath, content.replaceAll("{{PROJECT_NAME}}", projectName));
        }
      } catch {
        /* binario o ilegible: lo ignoramos */
      }
    }
  }
}

function run(cmd: string, args: string[], cwd: string): boolean {
  const res = spawnSync(cmd, args, { cwd, stdio: "ignore", shell: process.platform === "win32" });
  return res.status === 0;
}

async function main(): Promise<void> {
  console.log("");
  intro(pc.bgCyan(pc.black(" redlizard-template ")));

  // Separar flags de argumentos posicionales.
  const rawArgs = process.argv.slice(2);
  const flags = new Set(rawArgs.filter((a) => a.startsWith("-")));
  const positionals = rawArgs.filter((a) => !a.startsWith("-"));
  const nonInteractive =
    flags.has("--yes") || flags.has("-y") || !process.stdout.isTTY;

  // 1) Nombre del proyecto (argv o prompt).
  const argName = positionals[0];
  let projectName = argName;
  if (!projectName) {
    if (nonInteractive) {
      log.error("Falta el nombre del proyecto. Uso: redlizard-template <nombre> [--yes]");
      process.exit(1);
    }
    projectName = unwrap(
      await text({
        message: "¿Nombre del proyecto?",
        placeholder: "mi-app",
        validate: (v) =>
          !v
            ? "Ingresá un nombre."
            : !isValidProjectName(v)
              ? "Usá minúsculas, números, guiones o guiones bajos."
              : undefined,
      }),
    );
  } else if (!isValidProjectName(projectName)) {
    log.error(`Nombre inválido: ${pc.red(projectName)} (minúsculas, números, - y _).`);
    process.exit(1);
  }

  const targetDir = resolve(process.cwd(), projectName);
  if (existsSync(targetDir)) {
    const dirContents = await readdir(targetDir).catch(() => []);
    if (dirContents.length > 0) {
      log.error(`El directorio ${pc.red(projectName)} ya existe y no está vacío.`);
      process.exit(1);
    }
  }

  // 2) Gestor de paquetes.
  const pm = (
    nonInteractive
      ? "npm"
      : unwrap(
          await select({
            message: "¿Gestor de paquetes?",
            options: [
              { value: "npm", label: "npm" },
              { value: "pnpm", label: "pnpm" },
              { value: "yarn", label: "yarn" },
              { value: "bun", label: "bun" },
            ],
            initialValue: "npm",
          }),
        )
  ) as PkgManager;

  // 3) Plataforma de CI/CD (qué archivos de pipeline generar).
  const ciFlag = rawArgs
    .find((a) => a.startsWith("--ci="))
    ?.split("=")[1] as CiProvider | undefined;
  const validCi: CiProvider[] = ["github", "bitbucket", "gitlab", "none"];
  const ci: CiProvider = ciFlag && validCi.includes(ciFlag)
    ? ciFlag
    : nonInteractive
      ? "github"
      : (unwrap(
          await select({
            message: "¿Plataforma de CI/CD? (deploy de migraciones)",
            options: [
              { value: "github", label: "GitHub Actions" },
              { value: "bitbucket", label: "Bitbucket Pipelines" },
              { value: "gitlab", label: "GitLab CI" },
              { value: "none", label: "Ninguna por ahora" },
            ],
            initialValue: "github",
          }),
        ) as CiProvider);

  // 4) ¿Instalar dependencias e inicializar git?
  const doInstall = nonInteractive
    ? false
    : unwrap(await confirm({ message: "¿Instalar dependencias ahora?", initialValue: true }));
  const doGit = nonInteractive
    ? false
    : unwrap(await confirm({ message: "¿Inicializar repositorio git?", initialValue: true }));

  // 4) Scaffolding.
  const s = spinner();
  s.start("Generando el proyecto");
  await mkdir(targetDir, { recursive: true });
  await copyTemplate(targetDir, projectName, ci);
  s.stop("Proyecto generado ✓");

  if (doGit) {
    s.start("Inicializando git");
    const ok = run("git", ["init"], targetDir) && run("git", ["add", "-A"], targetDir);
    s.stop(ok ? "Git inicializado ✓" : "git no disponible (omitido)");
  }

  if (doInstall) {
    s.start(`Instalando dependencias con ${pm}`);
    const ok = run(pm, ["install"], targetDir);
    s.stop(ok ? "Dependencias instaladas ✓" : `Falló ${pm} install (instalá manualmente)`);
  }

  // 5) Próximos pasos.
  const runCmd = pm === "npm" ? "npm run" : pm;
  note(
    [
      `${pc.dim("1.")} cd ${projectName}`,
      `${pc.dim("2.")} Copiá tus credenciales en ${pc.cyan(".env.local")}`,
      `${pc.dim("   ")} (Supabase Dashboard → Connect → App Frameworks)`,
      `${pc.dim("3.")} ${pc.cyan("supabase login")} && ${pc.cyan("supabase link")} y aplicá las migraciones:`,
      `${pc.dim("   ")} ${pc.cyan("supabase db push")}`,
      `${pc.dim("4.")} Autenticá el MCP de Supabase en Claude Code: ${pc.cyan("claude /mcp")}`,
      `${pc.dim("5.")} ${pc.cyan(`${runCmd} dev`)}`,
    ].join("\n"),
    "Próximos pasos",
  );

  outro(pc.green(`Listo. ${pc.bold(projectName)} quedó configurado con seguridad e2e 🛡️`));
}

main().catch((err) => {
  log.error(String(err?.stack ?? err));
  process.exit(1);
});
