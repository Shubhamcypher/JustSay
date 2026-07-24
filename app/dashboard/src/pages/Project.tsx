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


// import { useParams } from "react-router-dom";
// import { useState } from "react";
// import { startProject, stopProject } from "../api/project.api";

// export default function Project() {
//   const { id } = useParams();
//   const [previewUrl, setPreviewUrl] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleRun = async () => {
//     try {
//       setLoading(true);

//       const res = await startProject(id!);

//       console.log("RUN RESPONSE:", res.data);

//       setPreviewUrl(res.data.preview);

//     } catch (err) {
//       console.error("RUN ERROR:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStop = async () => {
//     try {
//       await stopProject(id!);
//       setPreviewUrl("");
//     } catch (err) {
//       console.error("STOP ERROR:", err);
//     }
//   };

//   return (
//     <div style={{ height: "100vh" }}>
//       <h2>Project</h2>

//       <button onClick={handleRun}>▶ Run</button>
//       <button onClick={handleStop}>⏹ Stop</button>

//       {loading && <p>Starting project...</p>}

//       {previewUrl && (
//         <iframe
//           src={previewUrl}
//           style={{
//             width: "100%",
//             height: "90%",
//             border: "none",
//             marginTop: "10px"
//           }}
//         />
//       )}
//     </div>
//   );
// }


import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { startProject, stopProject, getFiles, updateFile } from "../api/project.api";

export default function Project() {
  const { id } = useParams();

  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const res = await getFiles(id!);
    setFiles(res.data);
  };

  const handleSelectFile = (file: any) => {
    setSelectedFile(file);
    setContent(file.content);
  };

  const handleSave = async () => {
    await updateFile(id!, {
      path: selectedFile.path,
      content,
    });

    alert("Saved!");
  };

  const handleRun = async () => {
    const res = await startProject(id!);
    setPreviewUrl(res.data.preview);
  };

  const handleStop = async () => {
    await stopProject(id!);
    setPreviewUrl("");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT: FILE LIST */}
      <div style={{ width: "250px", borderRight: "1px solid gray" }}>
        <h3>Files</h3>
        {files.map((f) => (
          <div key={f.path} onClick={() => handleSelectFile(f)}>
            {f.path}
          </div>
        ))}
      </div>

      {/* CENTER: EDITOR */}
      <div style={{ flex: 1, padding: "10px" }}>
        <h3>{selectedFile?.path}</h3>

        {selectedFile && (
          <>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: "100%", height: "300px" }}
            />

            <br />

            <button onClick={handleSave}>💾 Save</button>
            <button onClick={handleRun}>▶ Run</button>
            <button onClick={handleStop}>⏹ Stop</button>
          </>
        )}

        {previewUrl && (
          <iframe
            src={previewUrl}
            style={{ width: "100%", height: "50%", border: "none", marginTop: "10px" }}
          />
        )}
      </div>
    </div>
  );
}     