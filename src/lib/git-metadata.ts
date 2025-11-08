const isNodeRuntime = typeof process !== "undefined" && Boolean(process.versions?.node);

let execFileSync: typeof import("node:child_process").execFileSync | undefined;
let existsSync: typeof import("node:fs").existsSync | undefined;
let pathModule: typeof import("node:path") | undefined;
let fileURLToPath: typeof import("node:url").fileURLToPath | undefined;

if (isNodeRuntime) {
  const [{ execFileSync: childExec }, { existsSync: fsExistsSync }, pathImport, { fileURLToPath: urlToPath }] =
    await Promise.all([
      import("node:child_process"),
      import("node:fs"),
      import("node:path"),
      import("node:url"),
    ]);
  execFileSync = childExec;
  existsSync = fsExistsSync;
  pathModule = pathImport;
  fileURLToPath = urlToPath;
}

const PROJECT_ROOT =
  isNodeRuntime && fileURLToPath && pathModule
    ? fileURLToPath(new URL("../../", import.meta.url))
    : undefined;
const POSTS_CONTENT_DIR = PROJECT_ROOT && pathModule ? pathModule.join(PROJECT_ROOT, "src/content/posts") : undefined;
const gitTimestampCache = new Map<string, Date | null>();

function resolvePostFilePath(entryId: string): string | null {
  if (!POSTS_CONTENT_DIR || !pathModule || !existsSync) {
    return null;
  }

  const normalizedId = entryId.replace(/\\/g, "/");
  const candidates = [normalizedId];

  if (!normalizedId.endsWith(".mdx")) {
    candidates.push(`${normalizedId}.mdx`);
  }

  if (!normalizedId.endsWith(".md")) {
    candidates.push(`${normalizedId}.md`);
  }

  for (const candidate of candidates) {
    const absolutePath = pathModule.join(POSTS_CONTENT_DIR, candidate);
    if (existsSync(absolutePath)) {
      return absolutePath;
    }
  }

  return null;
}

function readGitTimestamp(relativePath: string): Date | null {
  if (!execFileSync || !PROJECT_ROOT) {
    return null;
  }

  if (gitTimestampCache.has(relativePath)) {
    return gitTimestampCache.get(relativePath) ?? null;
  }

  try {
    const isoString = execFileSync("git", ["log", "-1", "--format=%cI", "--", relativePath], {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    if (!isoString) {
      gitTimestampCache.set(relativePath, null);
      return null;
    }

    const parsed = new Date(isoString);
    if (Number.isNaN(parsed.getTime())) {
      gitTimestampCache.set(relativePath, null);
      return null;
    }

    gitTimestampCache.set(relativePath, parsed);
    return parsed;
  } catch {
    gitTimestampCache.set(relativePath, null);
    return null;
  }
}

export function getGitLastModifiedDate(entryId: string): Date | null {
  if (!isNodeRuntime || !PROJECT_ROOT || !pathModule) {
    return null;
  }

  const filePath = resolvePostFilePath(entryId);
  if (!filePath) return null;

  const relativePath = pathModule.relative(PROJECT_ROOT, filePath);
  return readGitTimestamp(relativePath);
}
