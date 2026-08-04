import { useMemo } from "react";

// Converts flat path map into a nested folder/file tree
function buildFileTree(files: Record<string, any>) {
  const tree: any = {};

  Object.keys(files).forEach((path) => {
    const parts = path.split("/"); // "src/components/Button.tsx" → ["src", "components", "Button.tsx"]
    let current = tree;  // pointer that walks deeper on each iteration

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // Last segment — it's a file
        current[part] = { type: "file", path };
      } else {
        // Else it's a folder, create it if it doesn't exist yet
        if (!current[part]) {
          current[part] = { type: "folder", children: {} };
        }
        current = current[part].children; // step into the folder
      }
    });
  });

  return tree;
}

// Converts string[] of paths into a nested tree, only rebuilds when filePaths changes
export function useFileTree(filePaths: string[]) {
  return useMemo(() => {
    // buildFileTree expects a map, so convert array → Record first
    const obj: any = {};
    filePaths.forEach((path) => {
      obj[path] = { path };
    });
    return buildFileTree(obj);
  }, [filePaths]);
}