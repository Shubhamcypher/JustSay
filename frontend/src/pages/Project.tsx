// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { startProject, stopProject, getFiles } from "../api/project.api";

// export default function Project() {
//   const { id } = useParams();

//   const [files, setFiles] = useState([]);
//   const [previewUrl, setPreviewUrl] = useState("");

//   useEffect(() => {
//     fetchFiles();
//   }, []);

//   const fetchFiles = async () => {
//     const res = await getFiles(id!);
//     setFiles(res.data);
//   };

//   const handleRun = async () => {
//     const res = await startProject(id!);
//     setPreviewUrl(res.data.preview);
//   };

//   const handleStop = async () => {
//     await stopProject(id!);
//     setPreviewUrl("");
//   };

//   return (
//     <div style={{ display: "flex", height: "100vh" }}>
      
//       {/* LEFT: FILES */}
//       <div style={{ width: "20%", borderRight: "1px solid gray" }}>
//         {files.map((f: any) => (
//           <div key={f.id}>{f.path}</div>
//         ))}
//       </div>

//       {/* CENTER: ACTIONS */}
//       <div style={{ width: "30%", padding: "10px" }}>
//         <button onClick={handleRun}>Run</button>
//         <button onClick={handleStop}>Stop</button>
//       </div>

//       {/* RIGHT: PREVIEW */}
//       <div style={{ width: "50%" }}>
//         {previewUrl && (
//           <iframe
//             src={previewUrl}
//             style={{ width: "100%", height: "100%" }}
//           />
//         )}
//       </div>
//     </div>
//   );
// }


import { useParams } from "react-router-dom";
import { useState } from "react";
import { startProject, stopProject } from "../api/project.api";

export default function Project() {
  const { id } = useParams();
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    try {
      setLoading(true);

      const res = await startProject(id!);

      console.log("RUN RESPONSE:", res.data);

      setPreviewUrl(res.data.preview);

    } catch (err) {
      console.error("RUN ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      await stopProject(id!);
      setPreviewUrl("");
    } catch (err) {
      console.error("STOP ERROR:", err);
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <h2>Project</h2>

      <button onClick={handleRun}>▶ Run</button>
      <button onClick={handleStop}>⏹ Stop</button>

      {loading && <p>Starting project...</p>}

      {previewUrl && (
        <iframe
          src={previewUrl}
          style={{
            width: "100%",
            height: "90%",
            border: "none",
            marginTop: "10px"
          }}
        />
      )}
    </div>
  );
}