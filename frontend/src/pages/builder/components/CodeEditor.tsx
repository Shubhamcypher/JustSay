import { applyFixPipeline } from "@/utils/fixFiles";
import Editor from "@monaco-editor/react";
import { useEffect, useMemo } from "react";

export default function CodeEditor({
  activeFile,
  files,
  updateFileContent,
  editorRef,
  monacoRef,
}: any) {

  if (!activeFile || !files[activeFile]) {
    return (
      <div className="w-[100%] relative overflow-hidden bg-[#1e1e1e] p-6">
  
        {/* Scanner sweep */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 right-0 h-10 animate-scan"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(99,179,255,0.04), transparent)" }}
          />
        </div>
  
        {/* Generating indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs text-white/30 font-mono tracking-wider">Generating...</span>
        </div>
  
        {/* Skeleton lines */}
        <div className="flex flex-col gap-2.5">
          {[45, 72, 60, 30, null, 80, 55, 90, 40, 65, null, 50, 78, 35, 88, null, 62, 44, 70].map((w, i) =>
            w === null ? <div key={i} className="h-1.5" /> : (
              <div key={i} className="h-2.5 rounded bg-white/[0.08] animate-pulse"
                style={{ width: `${w}%`, animationDelay: `${i * 0.08}s` }}
              />
            )
          )}
        </div>
  
      </div>
    );
  }

  const fixedContent = useMemo(() => {
    if (!activeFile) return "";
    return applyFixPipeline(files)[activeFile]?.content || "";
  }, [files, activeFile]);


  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
  
    const model = editor.getModel();
    if (!model) return;
  
    const current = model.getValue();
    if (current === fixedContent) return;
  
    // check if user is near bottom
    const visible = editor.getVisibleRanges();
    const lastLine = model.getLineCount();
  
    const isAtBottom =
      visible.length > 0 &&
      visible[0].endLineNumber >= lastLine - 2;
  
    // update content WITHOUT resetting editor
    model.pushEditOperations(
      [],
      [
        {
          range: model.getFullModelRange(),
          text: fixedContent,
        },
      ],
      () => null
    );
  
    // auto scroll only if already at bottom
    if (isAtBottom) {
      editor.revealLine(lastLine);
    }
  }, [fixedContent]);

  return (
    <Editor
      height="100%"
      theme="vs-dark"
      path={`file:///${activeFile}`} // unique path per file — tells monaco to treat each file as a separate model, preserving undo history and cursor position
      defaultValue={fixedContent}
      language="typescript"
      beforeMount={(monaco) => {
        monacoRef.current = monaco; // store monaco API before editor renders, used for config/theming
      }}
      onMount={(editor) => {
        editorRef.current = editor; // store editor instance after render, used for programmatic control
      }}
      onChange={(value) => {
        updateFileContent(activeFile, value || ""); // keep file state in sync on every keystroke, passed in builder by spreading fileSystem
      }}
      options={{
        // Typography
        fontSize: 14,
        fontFamily: "JetBrains Mono, Fira Code, Consolas, monospace",
        fontLigatures: true,          // renders → as arrow, != as ≠ etc.
        lineHeight: 22,
      
        // Layout
        minimap: { enabled: true, size: "proportional", },
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        lineNumbers: "on",
        lineDecorationsWidth: 4,      // gap between line numbers and code
        glyphMargin: true,            // left gutter for breakpoints/icons
        folding: true,                // code folding arrows
        foldingHighlight: true,       // highlights foldable regions on hover
      
        // Indentation
        tabSize: 2,
        insertSpaces: true,           // spaces instead of tabs
        detectIndentation: true,      // auto-detect from file content
      
        // Formatting
        formatOnPaste: true,
        formatOnType: true,
        wordWrap: "on",
        wrappingIndent: "indent",     // wrapped lines indent to match block
      
        // Editing feel
        cursorBlinking: "smooth",     // "blink" | "smooth" | "phase" | "expand" | "solid"
        cursorSmoothCaretAnimation: "on",
        cursorStyle: "line",          // "line" | "block" | "underline"
        smoothScrolling: true,
        mouseWheelZoom: true,         // ctrl+scroll to zoom font size
        multiCursorModifier: "ctrlCmd", // ctrl+click for multi cursor
      
        // Intellisense & suggestions
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: "on",
        tabCompletion: "on",
        wordBasedSuggestions: "matchingDocuments",
        parameterHints: { enabled: true },
      
        // Brackets
        matchBrackets: "always",
        bracketPairColorization: { enabled: true }, // VS Code's colored bracket pairs
        guides: {
          bracketPairs: true,         // vertical lines connecting bracket pairs
          indentation: true,          // indentation guide lines
        },
      
        // Selection & highlight
        renderLineHighlight: "all",   // "none" | "gutter" | "line" | "all"
        occurrencesHighlight: "singleFile", // highlights all occurrences of selected word
        selectionHighlight: true,
      
        // Whitespace & rulers
        renderWhitespace: "selection", // "none" | "boundary" | "selection" | "all"
        rulers: [80, 120],            // vertical ruler lines at col 80 and 120
      
        // Scrollbar
        scrollbar: {
          vertical: "auto",
          horizontal: "auto",
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
      
        // Diff / readonly
        readOnly: false,
        domReadOnly: false,
      
        // Accessibility
        accessibilitySupport: "auto",
      }}
    />
  );
}