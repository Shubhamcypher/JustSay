// utils/cache.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";

const BASE = "./cache";

function hash(input: string) {
  return crypto.createHash("md5").update(input).digest("hex");
}

export function getCache(type: string, key: string) {
  const file = path.join(BASE, type, hash(key) + ".json");

  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  }

  return null;
}

export function setCache(type: string, key: string, data: any) {
  const dir = path.join(BASE, type);
  fs.mkdirSync(dir, { recursive: true });

  const file = path.join(dir, hash(key) + ".json");
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}