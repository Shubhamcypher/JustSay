import { useEffect, useState } from "react";
import { getProjects, createProject, startProject } from "../api/project.api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
  };

  const handleCreate = async () => {
    const res = await createProject({
      name: "New Project",
      stack: "react",
    });

    navigate(`/project/${res.data.id}`);
  };

  const handleRun = async (projectId: string) => {
    try {
      const res = await startProject(projectId);
  
      console.log("RUN RESPONSE:", res);
  
      // navigate to preview page
      window.open(res.preview, "_blank");
  
    } catch (err) {
      console.error("RUN ERROR:", err);
    }
  };

  return (
    <div>
      <h1>Projects</h1>

      <button onClick={handleCreate}>Create Project</button>

      {projects.map((p: any) => (
        <div key={p.id} onClick={() => navigate(`/project/${p.id}`)}>
          {p.name}
        </div>
      ))}
    </div>
  );
}