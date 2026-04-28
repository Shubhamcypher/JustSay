export function applyFixPipeline(files: Record<string, any>) {
  let f = JSON.parse(JSON.stringify(files));

  // ✅ These are owned by the template — never touch them
  const TEMPLATE_FILES = new Set([
      "package.json",
      "vite.config.ts",
      "tailwind.config.js",
      "postcss.config.js",
      "index.html",
      "src/index.css",
  ]);





  function fixExports(files: Record<string, any>) {
    const newFiles = { ...files };
    for (const path in newFiles) {
        if (TEMPLATE_FILES.has(path)) continue;
        let content = newFiles[path].content;
        if (typeof content !== "string") {
            console.warn("Skipping non-string file:", path, content);
            continue;
        }

        // ✅ Only match at line start to avoid firing inside JSX
        content = content.replace(/^export const (\w+)\s*=\s*\(/gm, "const $1 = (");

        content = content.replace(
            /const (\w+)\s*=\s*\(/g,
            (match: any, fnName: any) => {
                if (path.includes("hooks")) return `const ${fnName} = (`;
                return match;
            }
        );

        // ✅ Match hook name specifically using use* convention
        if (path.includes("hooks") && !content.includes("export default")) {
            const match = content.match(/const (use\w+)\s*=/);
            if (match) {
                content += `\n\nexport default ${match[1]};`;
            }
        }

        content = content.replace(
            /import\s+{?\s*(\w+)\s*}?\s+from\s+['"](.*hooks\/.*)['"]/g,
            "import $1 from '$2'"
        );

        newFiles[path].content = content;
    }
    return newFiles;
}
  function fixBrokenStyleImports(files: Record<string, any>) {
      const newFiles = { ...files };
      for (const filePath in newFiles) {
          if (TEMPLATE_FILES.has(filePath)) continue; // ✅ skip template files
          let content = newFiles[filePath].content;
          if (typeof content !== "string") continue;
          content = content.replace(/import\s+['"]styles\//g, `import './styles/`);
          newFiles[filePath].content = content;
      }
      return newFiles;
  }

  function detectDependencies(files: Record<string, any>) {
    const deps: Record<string, string> = {};

    const content = Object.values(files)
        .map((f: any) => f.content)
        .join("\n");

    if (/from ["']react-redux["']/.test(content)) deps["react-redux"] = "^2.0.0";
    if (/from ["']@reduxjs\/toolkit["']/.test(content)) deps["@reduxjs/toolkit"] = "^2.0.0";
    if (/from ["']axios["']/.test(content)) deps["axios"] = "^1.6.0";
    if (/from ["']react-router-dom["']/.test(content)) deps["react-router-dom"] = "^6.20.0";
    if (/from ["']framer-motion["']/.test(content)) deps["framer-motion"] = "^11.0.0";
    if (/from ["']zustand["']/.test(content)) deps["zustand"] = "^4.5.0";
    if (/from ["']@tanstack\/react-query["']/.test(content)) deps["@tanstack/react-query"] = "^5.0.0";
    if (/from ["']react-hook-form["']/.test(content)) deps["react-hook-form"] = "^7.0.0";
    if (/from ["']zod["']/.test(content)) deps["zod"] = "^3.0.0";
    if (/from ["']date-fns["']/.test(content)) deps["date-fns"] = "^3.0.0";
    if (/from ["']lucide-react["']/.test(content)) deps["lucide-react"] = "^0.400.0";
    if (/from ["']recharts["']/.test(content)) deps["recharts"] = "^2.10.0";
    if (/from ["']clsx["']/.test(content)) deps["clsx"] = "^2.0.0";

    return deps;
}

function fixPackageJson(files: Record<string, any>) {
  const newFiles = { ...files };
  const detectedDeps = detectDependencies(files);

  let existing: any = {};
  try {
      existing = JSON.parse(newFiles["package.json"]?.content || "{}");
  } catch {
      existing = {};
  }

  const dependencies = { ...existing.dependencies };

  // ✅ Only add if not already present, use pinned versions
  for (const [pkg, version] of Object.entries(detectedDeps)) {
      if (!dependencies[pkg]) {
          dependencies[pkg] = version;
      }
  }

  newFiles["package.json"] = {
      path: "package.json",
      content: JSON.stringify(
          {
              ...existing,
              dependencies,
          },
          null,
          2
      ),
  };

  return newFiles;
}


  f = fixExports(f);
  f = fixBrokenStyleImports(f);
  f = fixPackageJson(f);

  return f;
}