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
// After the build, dist/ and template/ are siblings inside the published package.
const TEMPLATE_DIR = resolve(__dirname, "../template");

// Template files shipped with a "_" prefix so they don't break npm/git on publish.
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
  cancel("Operation cancelled.");
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

  // Apply the chosen CI preset and drop the presets folder.
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

// Walk the copied tree, rename the "_*" files and replace placeholders.
async function renameAndReplace(dir: string, projectName: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      await renameAndReplace(fullPath, projectName);
      continue;
    }
    // Rename if needed.
    let finalPath = fullPath;
    const mapped = RENAME_MAP[entry.name];
    if (mapped) {
      finalPath = join(dir, mapped);
      await rename(fullPath, finalPath);
    }
    // Replace placeholders only in text files.
    if (/\.(json|ts|tsx|js|jsx|css|md|sql|toml|env|example|txt|yml|yaml|html)$/i.test(finalPath) || basename(finalPath).startsWith(".")) {
      try {
        const content = await readFile(finalPath, "utf8");
        if (content.includes("{{PROJECT_NAME}}")) {
          await writeFile(finalPath, content.replaceAll("{{PROJECT_NAME}}", projectName));
        }
      } catch {
        /* binary or unreadable: skip */
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

  // Split flags from positional arguments.
  const rawArgs = process.argv.slice(2);
  const flags = new Set(rawArgs.filter((a) => a.startsWith("-")));
  const positionals = rawArgs.filter((a) => !a.startsWith("-"));
  const nonInteractive =
    flags.has("--yes") || flags.has("-y") || !process.stdout.isTTY;

  // 1) Project name (argv or prompt).
  const argName = positionals[0];
  let projectName = argName;
  if (!projectName) {
    if (nonInteractive) {
      log.error("Missing project name. Usage: redlizard-template <name> [--yes]");
      process.exit(1);
    }
    projectName = unwrap(
      await text({
        message: "Project name?",
        placeholder: "my-app",
        validate: (v) =>
          !v
            ? "Enter a name."
            : !isValidProjectName(v)
              ? "Use lowercase letters, numbers, hyphens or underscores."
              : undefined,
      }),
    );
  } else if (!isValidProjectName(projectName)) {
    log.error(`Invalid name: ${pc.red(projectName)} (lowercase, numbers, - and _).`);
    process.exit(1);
  }

  const targetDir = resolve(process.cwd(), projectName);
  if (existsSync(targetDir)) {
    const dirContents = await readdir(targetDir).catch(() => []);
    if (dirContents.length > 0) {
      log.error(`Directory ${pc.red(projectName)} already exists and is not empty.`);
      process.exit(1);
    }
  }

  // 2) Package manager.
  const pm = (
    nonInteractive
      ? "npm"
      : unwrap(
          await select({
            message: "Package manager?",
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

  // 3) CI/CD platform (which pipeline files to generate).
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
            message: "CI/CD platform? (migration deploys)",
            options: [
              { value: "github", label: "GitHub Actions" },
              { value: "bitbucket", label: "Bitbucket Pipelines" },
              { value: "gitlab", label: "GitLab CI" },
              { value: "none", label: "None for now" },
            ],
            initialValue: "github",
          }),
        ) as CiProvider);

  // 4) Install dependencies and/or initialize git?
  const doInstall = nonInteractive
    ? false
    : unwrap(await confirm({ message: "Install dependencies now?", initialValue: true }));
  const doGit = nonInteractive
    ? false
    : unwrap(await confirm({ message: "Initialize a git repository?", initialValue: true }));

  // 5) Scaffolding.
  const s = spinner();
  s.start("Generating the project");
  await mkdir(targetDir, { recursive: true });
  await copyTemplate(targetDir, projectName, ci);
  s.stop("Project generated ✓");

  if (doGit) {
    s.start("Initializing git");
    const ok = run("git", ["init"], targetDir) && run("git", ["add", "-A"], targetDir);
    s.stop(ok ? "Git initialized ✓" : "git not available (skipped)");
  }

  if (doInstall) {
    s.start(`Installing dependencies with ${pm}`);
    const ok = run(pm, ["install"], targetDir);
    s.stop(ok ? "Dependencies installed ✓" : `${pm} install failed (install manually)`);
  }

  // 6) Next steps.
  const runCmd = pm === "npm" ? "npm run" : pm;
  note(
    [
      `${pc.dim("1.")} cd ${projectName}`,
      `${pc.dim("2.")} Copy your credentials into ${pc.cyan(".env.local")}`,
      `${pc.dim("   ")} (Supabase Dashboard → Connect → App Frameworks)`,
      `${pc.dim("3.")} ${pc.cyan("supabase login")} && ${pc.cyan("supabase link")}, then apply the migrations:`,
      `${pc.dim("   ")} ${pc.cyan("supabase db push")}`,
      `${pc.dim("4.")} Authenticate the Supabase MCP in Claude Code: ${pc.cyan("claude /mcp")}`,
      `${pc.dim("5.")} ${pc.cyan(`${runCmd} dev`)}`,
    ].join("\n"),
    "Next steps",
  );

  outro(pc.green(`Done. ${pc.bold(projectName)} is set up with end-to-end security 🛡️`));
}

main().catch((err) => {
  log.error(String(err?.stack ?? err));
  process.exit(1);
});
