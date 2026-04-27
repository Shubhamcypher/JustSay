type FileContent = { content: string };

export function enforceFileStructure(
  files: Record<string, unknown>,
  stage: string
): Record<string, FileContent> {

  const fixed: Record<string, FileContent> = {};

  for (const [path, value] of Object.entries(files)) {

    if (!value) {
      console.warn(`⚠️ [${stage}] Skipping undefined file: ${path}`);
      continue;
    }

    // ✅ case 1: string → wrap it
    if (typeof value === "string") {
      fixed[path] = { content: value };
      continue;
    }

    // ✅ case 2: object with content
    if (
      typeof value === "object" &&
      value !== null &&
      "content" in value &&
      typeof (value as any).content === "string"
    ) {
      fixed[path] = value as FileContent;
      continue;
    }

    console.warn(`⚠️ [${stage}] Invalid format: ${path}`);
  }

  return fixed;
}