import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { pool } from "../config/db";

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
        // 1. Check DB for metadata
        const result = await pool.query(
            `SELECT s3_key FROM category_cache WHERE category = $1`,
            [category]
        );

        if (result.rows.length === 0) return null;

        const s3Key = result.rows[0].s3_key;

        // 2. Fetch JSON from S3
        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: s3Key,
        });

        const response = await s3.send(command);
        const body = await response.Body?.transformToString();

        if (!body) return null;

        const files = JSON.parse(body);
        console.log(`⚡ Category cache hit: ${category} → ${s3Key}`);
        return files;

    } catch (err) {
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

        // 1. Upload to S3
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: s3Key,
            Body: JSON.stringify(files),
            ContentType: "application/json",
        }));

        // 2. Save metadata to DB
        await pool.query(
            `INSERT INTO category_cache (category, s3_key, file_count)
             VALUES ($1, $2, $3)
             ON CONFLICT (category) DO UPDATE
             SET s3_key = $2, file_count = $3, created_at = NOW()`,
            [category, s3Key, Object.keys(files).length]
        );

        console.log(`💾 Category cached: ${category} → ${s3Key}`);

    } catch (err) {
        console.error("Category cache write error:", err);
    }
}