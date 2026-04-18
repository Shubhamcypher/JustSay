import { useMemo } from "react";

function buildFileTree(files: Record<string, any>) {
  const tree: any = {};

  Object.keys(files).forEach((path) => {
    const parts = path.split("/");
    let current = tree;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = { type: "file", path };
      } else {
        if (!current[part]) {
          current[part] = { type: "folder", children: {} };
        }
        current = current[part].children;
      }
    });
  });

  return tree;
}

export function useFileTree(filePaths: string[]) {
  return useMemo(() => {
    const obj: any = {};
    filePaths.forEach((path) => {
      obj[path] = { path };
    });
    return buildFileTree(obj);
  }, [filePaths]);
}