export function fixCommonBugs(files: Record<string, any>) {
    const newFiles = { ...files };

    for (const path in newFiles) {
        let content = newFiles[path]?.content;
        if (typeof content !== "string") continue;

        // ✅ Fix wrong arrow functions: () = {} → () => {}
        // Negative lookahead =(?!>) ensures we don't touch valid => {}
        content = content.replace(/\(\)\s*=(?!>)\s*\{/g, "() => {");

        // ✅ Fix missing arrow in handlers like onClick={() { ... }}
        content = content.replace(
            /onClick=\{\(\)\s*(?!=>)\{/g,
            "onClick={() => {"
        );

        // ✅ Fix parameters arrow functions: (e) = {} → (e) => {}
        content = content.replace(/\(([^)]+)\)\s*=(?!>)\s*\{/g, "($1) => {");

        // ✅ Prevent direct DOM mutation patterns
        content = content.replace(
            /document\.getElementById\([^)]+\)\.className\s*=/g,
            "// ❌ removed unsafe DOM mutation"
        );

        newFiles[path].content = content;
    }

    return newFiles;
}