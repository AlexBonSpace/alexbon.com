#!/usr/bin/env node
import fg from "fast-glob";
import matter from "gray-matter";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const POSTS_GLOB = "src/content/posts/**/*.mdx";

const args = process.argv.slice(2);
const isCheck = args.includes("--check");
const explicitFiles = args.filter((arg) => !arg.startsWith("--"));

async function getGitTimestamp(file) {
  try {
    const { stdout } = await execFileAsync("git", ["log", "-1", "--format=%cI", "--", file], { cwd: ROOT });
    const trimmed = stdout.trim();
    return trimmed ? new Date(trimmed).toISOString() : null;
  } catch {
    return null;
  }
}

async function main() {
  let files = explicitFiles;
  if (files.length === 0) {
    files = await fg(POSTS_GLOB, { cwd: ROOT });
  }

  if (files.length === 0) {
    console.log("[sync-updated-at] No files to process.");
    return;
  }

  let hasMismatch = false;
  const updated = [];

  for (const relativeFile of files) {
    const absolute = path.join(ROOT, relativeFile);
    const raw = await readFile(absolute, "utf8");
    const parsed = matter(raw);

    if (!parsed.data.publishedAt) {
      console.warn(`[sync-updated-at] Skipping ${relativeFile}: missing publishedAt`);
      continue;
    }

    const gitIso = (await getGitTimestamp(relativeFile)) ?? new Date(parsed.data.publishedAt).toISOString();
    const currentIso = parsed.data.updatedAt ? new Date(parsed.data.updatedAt).toISOString() : null;

    if (currentIso === gitIso) {
      continue;
    }

    if (isCheck) {
      hasMismatch = true;
      console.error(`[sync-updated-at] ${relativeFile} has outdated updatedAt (expected ${gitIso})`);
      continue;
    }

    parsed.data.updatedAt = gitIso;
    const next = matter.stringify(parsed.content, parsed.data, { lineWidth: 1000 });
    await writeFile(absolute, next.endsWith("\n") ? next : `${next}\n`);
    updated.push(relativeFile);
  }

  if (isCheck) {
    if (hasMismatch) {
      process.exitCode = 1;
    } else {
      console.log("[sync-updated-at] All updatedAt values are in sync.");
    }
    return;
  }

  if (updated.length > 0) {
    console.log(`[sync-updated-at] Updated timestamps in ${updated.length} file(s).`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
