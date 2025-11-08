import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const POSTS_CONTENT_DIR = path.join(PROJECT_ROOT, "src/content/posts");
const gitTimestampCache = new Map<string, Date | null>();

function resolvePostFilePath(entryId: string): string | null {
  const normalizedId = entryId.replace(/\\/g, "/");
  const candidates = [normalizedId];

  if (!normalizedId.endsWith(".mdx")) {
    candidates.push(`${normalizedId}.mdx`);
  }

  if (!normalizedId.endsWith(".md")) {
    candidates.push(`${normalizedId}.md`);
  }

  for (const candidate of candidates) {
    const absolutePath = path.join(POSTS_CONTENT_DIR, candidate);
    if (existsSync(absolutePath)) {
      return absolutePath;
    }
  }

  return null;
}

function readGitTimestamp(relativePath: string): Date | null {
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
  const filePath = resolvePostFilePath(entryId);
  if (!filePath) return null;

  const relativePath = path.relative(PROJECT_ROOT, filePath);
  return readGitTimestamp(relativePath);
}
