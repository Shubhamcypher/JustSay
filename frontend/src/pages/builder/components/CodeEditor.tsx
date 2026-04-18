import Editor from "@monaco-editor/react";


export default function CodeEditor({
    activeFile,
    files,
    updateFileContent,
    editorRef,
    monacoRef,
  }: any) {
  
    // 🚨 HARD GUARD
    if (!activeFile || !files[activeFile]) {
      return (
        <div className="flex-1 flex items-center justify-center text-white/40">
          Loading editor...
        </div>
      );
    }
  
    return (
      <Editor
        height="100%"
        theme="vs-dark"
        path={`file:///${activeFile}`} // 🔥 important fix
        value={files[activeFile].content || ""}
        language="typescript"
        beforeMount={(monaco) => {
          monacoRef.current = monaco;
        }}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
        onChange={(value) => {
          updateFileContent(activeFile, value || "");
        }}
      />
    );
  }