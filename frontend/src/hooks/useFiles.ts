import { useState } from "react";

type File = {
  path: string;
  content: string;
};

export function useFiles() {
  const [files, setFiles] = useState<Record<string, File>>({});
  const [filePaths, setFilePaths] = useState<string[]>([]); // 👈 NEW
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const addFile = (file: File) => {
    setFiles((prev) => ({
      ...prev,
      [file.path]: file,
    }));

    // 👇 ONLY update tree here
    setFilePaths((prev) => {
      if (prev.includes(file.path)) return prev;
      return [...prev, file.path];
    });

    if (!activeFile) {
      setActiveFile(file.path);
    }
  };

  const updateFileContent = (path: string, content: string) => {
    // 👇 ONLY update content (tree untouched)
    setFiles((prev) => ({
      ...prev,
      [path]: {
        ...prev[path],
        content,
      },
    }));
  };

  return {
    files,
    filePaths, // 👈 use this for tree
    activeFile,
    setActiveFile,
    addFile,
    updateFileContent,
  };
}