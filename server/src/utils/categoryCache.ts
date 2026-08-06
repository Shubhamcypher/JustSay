import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

const BUCKET = process.env.S3_BUCKET_NAME!;

// ─── Check if category cache exists ───────────────────────────
export async function getCachedCategory(
    category: string
): Promise<Record<string, { content: string }> | null> {
    try {
        const s3Key = `categories/${category}/final-files.json`;

        const response = await s3.send(
            new GetObjectCommand({
                Bucket: BUCKET,
                Key: s3Key,
            })
        );

        const body = await response.Body?.transformToString();

        if (!body) return null;

        console.log(`⚡ Category cache hit: ${category} → ${s3Key}`);

        return JSON.parse(body);

    } catch (err: any) {
        if (err.name === "NoSuchKey") {
            return null;
        }

        console.error("Category cache read error:", err);
        return null;
    }
}

// ─── Save category cache ───────────────────────────────────────
export async function setCachedCategory(
    category: string,
    files: Record<string, { content: string }>
): Promise<void> {
    try {
        const s3Key = `categories/${category}/final-files.json`;

        await s3.send(
            new PutObjectCommand({
                Bucket: BUCKET,
                Key: s3Key,
                Body: JSON.stringify(files),
                ContentType: "application/json",
            })
        );

        console.log(`💾 Category cached: ${category} → ${s3Key}`);

    } catch (err) {
        console.error("Category cache write error:", err);
    }
}