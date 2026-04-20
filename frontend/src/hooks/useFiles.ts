import { useState } from "react";

type File = {
  path: string;
  content: string;
};

export function useFiles(userSelectedRef: any) {
  const [files, setFiles] = useState<Record<string, File>>({});
  const [filePaths, setFilePaths] = useState<string[]>([]);
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
    if (!activeFile && !userSelectedRef.current) {
      setActiveFile(file.path);
    }
  };

  const updateFileContent = (path: string, content: string) => {
    // Updates content only — filePaths untouched, no tree re-render
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