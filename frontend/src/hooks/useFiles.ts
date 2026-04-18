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
    //update with the incoming files
    setFiles((prev) => ({
      ...prev,
      [file.path]: file,
    }));

    // ONLY update tree here
    setFilePaths((prev) => {
      if (prev.includes(file.path)) return prev; //removes duplicate
      return [...prev, file.path]; //adding upcoming non-duplicate file in the file tree
    });

    //Ensures first added file is auto-opened
    // Does NOT switch active file if one is already selected
    if (!activeFile) {
      setActiveFile(file.path);
    }
  };

  const updateFileContent = (path: string, content: string) => {
    //ONLY update content (tree untouched)
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
    filePaths,
    activeFile,
    setActiveFile,
    addFile,
    updateFileContent,
  };
}