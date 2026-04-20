import Editor from "@monaco-editor/react";

export default function CodeEditor({
    activeFile,      
    files,           
    updateFileContent,
    editorRef,        
    monacoRef,       
  }: any) {
  
    // Bail early if no file is selected or file content isn't ready yet
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
        path={`file:///${activeFile}`} // unique path per file — tells monaco to treat each file as a separate model, preserving undo history and cursor position
        value={files[activeFile].content || ""}
        language="typescript"
        beforeMount={(monaco) => {
          monacoRef.current = monaco; // store monaco API before editor renders, used for config/theming
        }}
        onMount={(editor) => {
          editorRef.current = editor; // store editor instance after render, used for programmatic control
        }}
        onChange={(value) => {
          updateFileContent(activeFile, value || ""); // keep file state in sync on every keystroke
        }}
      />
    );
  }