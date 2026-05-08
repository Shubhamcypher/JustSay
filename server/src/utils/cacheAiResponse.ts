import fs from "fs";
import path from "path";
import crypto from "crypto";

const CACHE_ROOT = path.join(process.cwd(), "cache", "projects");

function promptToSlug(prompt: string): string {
    const words = prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 5)
        .join("-");
    const hash = crypto.createHash("md5").update(prompt).digest("hex").slice(0, 6);
    return `${words}-${hash}`;
}

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function projectDir(prompt: string): string {
    return path.join(CACHE_ROOT, promptToSlug(prompt));
}

// ─── Planner ──────────────────────────────────────────────────
export function getCachedPlan(prompt: string) {
    const file = path.join(projectDir(prompt), "planner.json");
    if (!fs.existsSync(file)) return null;
    console.log("⚡ Cache hit: planner");
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function setCachedPlan(prompt: string, data: any) {
    const dir = projectDir(prompt);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, "planner.json"), JSON.stringify(data, null, 2));
    console.log("💾 Cached: planner →", promptToSlug(prompt));
}

// ─── Features ─────────────────────────────────────────────────
export function getCachedFeatures(prompt: string) {
    const file = path.join(projectDir(prompt), "features.json");
    if (!fs.existsSync(file)) return null;
    console.log("⚡ Cache hit: features");
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function setCachedFeatures(prompt: string, data: any) {
    const dir = projectDir(prompt);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, "features.json"), JSON.stringify(data, null, 2));
    console.log("💾 Cached: features →", promptToSlug(prompt));
}

// ─── Skeletons ────────────────────────────────────────────────
export function getCachedSkeletons(prompt: string) {
    const file = path.join(projectDir(prompt), "skeletons.json");
    if (!fs.existsSync(file)) return null;
    console.log("⚡ Cache hit: skeletons");
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function setCachedSkeletons(prompt: string, data: any) {
    const dir = projectDir(prompt);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, "skeletons.json"), JSON.stringify(data, null, 2));
    console.log("💾 Cached: skeletons →", promptToSlug(prompt));
}

// ─── Final files ──────────────────────────────────────────────
export function getCachedFinalFiles(
    prompt: string
): Record<string, { content: string }> | null {
    const baseDir = path.join(projectDir(prompt), "final-files");
    const indexFile = path.join(baseDir, "_index.json");
    if (!fs.existsSync(indexFile)) return null;

    const index: string[] = JSON.parse(fs.readFileSync(indexFile, "utf-8"));
    const files: Record<string, { content: string }> = {};

    for (const filePath of index) {
        const diskPath = path.join(baseDir, filePath);
        if (fs.existsSync(diskPath)) {
            files[filePath] = { content: fs.readFileSync(diskPath, "utf-8") };
        }
    }

    console.log(`⚡ Cache hit: final-files (${index.length} files) → ${promptToSlug(prompt)}`);
    return files;
}

export function setCachedFinalFiles(
    prompt: string,
    files: Record<string, { content: string }>
) {
    const baseDir = path.join(projectDir(prompt), "final-files");
    ensureDir(baseDir);

    const index: string[] = [];

    for (const [filePath, file] of Object.entries(files)) {
        const content = typeof file === "string"
            ? file
            : (file as any)?.content || "";

        const diskPath = path.join(baseDir, filePath);
        ensureDir(path.dirname(diskPath));
        fs.writeFileSync(diskPath, content, "utf-8");
        index.push(filePath);
    }

    fs.writeFileSync(
        path.join(baseDir, "_index.json"),
        JSON.stringify(index, null, 2)
    );

    console.log(`💾 Cached: final-files (${index.length} files) → ${promptToSlug(prompt)}`);
}