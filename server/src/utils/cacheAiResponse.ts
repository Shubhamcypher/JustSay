import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

const BUCKET = process.env.S3_BUCKET_NAME!;

function promptToSlug(prompt: string): string {
    const words = prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 5)
        .join("-");
    const hash = crypto.createHash("md5").update(prompt).digest("hex").slice(0, 6);
    return `prompts/${words}-${hash}`;
}

async function getFromS3(key: string): Promise<any | null> {
    try {
        const response = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
        const body = await response.Body?.transformToString();
        if (!body) return null;
        return JSON.parse(body);
    } catch (err: any) {
        if (err.name === "NoSuchKey") return null;
        console.error(`S3 read error [${key}]:`, err);
        return null;
    }
}

async function setToS3(key: string, data: any): Promise<void> {
    try {
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: JSON.stringify(data),
            ContentType: "application/json",
        }));
    } catch (err) {
        console.error(`S3 write error [${key}]:`, err);
    }
}

// ─── Planner ──────────────────────────────────────────────────
export async function getCachedPlan(prompt: string): Promise<any | null> {
    const result = await getFromS3(`${promptToSlug(prompt)}/plan.json`);
    if (result) console.log("⚡ Cache hit: planner");
    return result;
}

export async function setCachedPlan(prompt: string, data: any): Promise<void> {
    await setToS3(`${promptToSlug(prompt)}/plan.json`, data);
    console.log("💾 Cached: planner");
}

// ─── Features ─────────────────────────────────────────────────
export async function getCachedFeatures(prompt: string): Promise<any | null> {
    const result = await getFromS3(`${promptToSlug(prompt)}/features.json`);
    if (result) console.log("⚡ Cache hit: features");
    return result;
}

export async function setCachedFeatures(prompt: string, data: any): Promise<void> {
    await setToS3(`${promptToSlug(prompt)}/features.json`, data);
    console.log("💾 Cached: features");
}

// ─── Skeletons ────────────────────────────────────────────────
export async function getCachedSkeletons(prompt: string): Promise<any | null> {
    const result = await getFromS3(`${promptToSlug(prompt)}/skeletons.json`);
    if (result) console.log("⚡ Cache hit: skeletons");
    return result;
}

export async function setCachedSkeletons(prompt: string, data: any): Promise<void> {
    await setToS3(`${promptToSlug(prompt)}/skeletons.json`, data);
    console.log("💾 Cached: skeletons");
}

// ─── Final Files ──────────────────────────────────────────────
export async function getCachedFinalFiles(
    prompt: string
): Promise<Record<string, { content: string }> | null> {
    const result = await getFromS3(`${promptToSlug(prompt)}/final-files.json`);
    if (result) console.log("⚡ Cache hit: final-files");
    return result;
}

export async function setCachedFinalFiles(
    prompt: string,
    files: Record<string, { content: string }>
): Promise<void> {
    await setToS3(`${promptToSlug(prompt)}/final-files.json`, files);
    console.log("💾 Cached: final-files");
}