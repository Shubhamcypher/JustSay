//Files Interface
export interface ProjectFile {
  path: string;
  content: string;
  fromStream?: boolean;
}

export type ProjectFiles = Record<string, ProjectFile>;


//Project Interfaces
export type Project = {
  id: string;
  name: string;
  snapshot?: string;
};

export interface ProjectMeta {
  id: string;
  name: string;
  snapshot?: string;
}

export type ProjectState = {
  created: Project[];
  shared: Project[];
  starred: Project[];
};


//Steps interface
export interface Step {
  id: number;
  loadingText: string;
  completedText: string;
  status: "loading" | "done";
  group: string;
}


// File tree interface
export interface FileNode {
  type: "file";
  path: string;
}

export interface FolderNode {
  type: "folder";
  children: FileTree;
}

export type TreeNode = FileNode | FolderNode;

export type FileTree = Record<string, TreeNode>;


//Session status types
export type SessionStatus =
    | "idle"
    | "checking"
    | "expired"
    | "refreshing"
    | "authenticated"
    | "failed";