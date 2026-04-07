import { useState } from "react";

type File = {
  path: string;
  content: string;
};

export function useFiles() {
  const [files, setFiles] = useState<Record<string, File>>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const addFile = (file: File) => {
    setFiles((prev) => {
      const updated = {
        ...prev,
        [file.path]: file,
      };

      // auto select first file
      if (!activeFile) {
        setActiveFile(file.path);
      }

      return updated;
    });
  };

  // ✅ NEW: update file content safely
  const updateFileContent = (path: string, content: string) => {
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
    activeFile,
    setActiveFile,
    addFile,
    updateFileContent, // 👈 use this instead of setFiles
  };
}