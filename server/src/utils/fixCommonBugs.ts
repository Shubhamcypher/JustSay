export function fixCommonBugs(files: Record<string, any>) {
    const newFiles = { ...files };

    for (const path in newFiles) {
        let content = newFiles[path]?.content;
        if (typeof content !== "string") continue;

        // ❌ Fix wrong arrow functions: () = {} → () => {}
        content = content.replace(/\(\)\s*=\s*\{/g, "() => {");

        // ❌ Fix className assignment inside functions
        content = content.replace(
            /className\s*=\s*`([^`]+)`/g,
            '/* FIXED: moved className out of JS */ "$1"'
        );

        // ❌ Fix missing arrow in handlers like onClick={() { ... }}
        content = content.replace(
            /onClick=\{\(\)\s*\{/g,
            "onClick={() => {"
        );

        // ❌ Prevent direct DOM mutation patterns
        content = content.replace(
            /document\.getElementById\([^)]+\)\.className\s*=/g,
            "// ❌ removed unsafe DOM mutation"
        );

        newFiles[path].content = content;
    }

    return newFiles;
}