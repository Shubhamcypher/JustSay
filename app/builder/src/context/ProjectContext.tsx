import { getProjects } from "@/api/project.api";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type { ProjectState } from "@shared/types";



type ProjectProviderProps = {
  children: ReactNode;
};



type ProjectContextType = {
  projects: ProjectState;
  refreshProjects: () => void;
};

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider = ({ children }: ProjectProviderProps) => {
  const [projects, setProjects] = useState<ProjectState>({
    created: [],
    shared: [],
    starred: [],
  });

  const fetchProjects = async () => {
    try {
      const [created, shared, starred] = await Promise.all([
        getProjects("created"),
        getProjects("shared"),
        getProjects("starred"),
      ]);

      setProjects({
        created: created.data,
        shared: shared.data,
        starred: starred.data,
      });

    } catch (err) {
      console.error("PROJECT FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        refreshProjects: fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used inside ProjectProvider");
  return ctx;
};