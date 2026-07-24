import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { startProject } from "../api/project.api";

export default function ProjectPreview() {
  const { id } = useParams();
  const [url, setUrl] = useState("");

  useEffect(() => {
    const run = async () => {
      const res = await startProject(id!);
      setUrl(res.preview);
    };

    run();
  }, [id]);

  return (
    <div style={{ height: "100vh" }}>
      {url ? (
        <iframe
          src={url}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      ) : (
        <p>Starting project...</p>
      )}
    </div>
  );
}