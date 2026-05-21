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

function promptToKey(prompt: string): string {
    const words = prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 5)
        .join("-");
    const hash = crypto.createHash("md5").update(prompt).digest("hex").slice(0, 6);
    return `prompts/${words}-${hash}/final-files.json`;
}

export async function getCachedFinalFiles(
    prompt: string
): Promise<Record<string, { content: string }> | null> {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: promptToKey(prompt),
        });

        const response = await s3.send(command);
        const body = await response.Body?.transformToString();
        if (!body) return null;

        console.log(`⚡ Exact cache hit (S3): ${promptToKey(prompt)}`);
        return JSON.parse(body);

    } catch (err: any) {
        // NoSuchKey = cache miss, anything else = real error
        if (err.name === "NoSuchKey") return null;
        console.error("Exact cache read error:", err);
        return null;
    }
}

export async function setCachedFinalFiles(
    prompt: string,
    files: Record<string, { content: string }>
): Promise<void> {
    try {
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: promptToKey(prompt),
            Body: JSON.stringify(files),
            ContentType: "application/json",
        }));

        console.log(`💾 Exact cache saved (S3): ${promptToKey(prompt)}`);

    } catch (err) {
        console.error("Exact cache write error:", err);
    }
}