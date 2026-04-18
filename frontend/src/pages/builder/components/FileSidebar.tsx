import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import StepsPanel from "./StepsPanel";

function getFileIcon(name: string) {
    if (name.endsWith(".tsx")) return "logos:react";
    if (name.endsWith(".ts")) return "logos:typescript-icon";
    if (name.endsWith(".js")) return "logos:javascript";
    if (name.endsWith(".json")) return "vscode-icons:file-type-json";
    if (name.endsWith(".html")) return "vscode-icons:file-type-html";
    if (name.endsWith(".css")) return "vscode-icons:file-type-css";
    return "vscode-icons:default-file";
}

// 🔥 Recursive tree (memoized)
const FileTree = React.memo(function FileTree({
    tree,
    activeFile,
    setActiveFile,
    openFolders,
    setOpenFolders,
    parentPath = "",
    level = 0,
}: any) {
    const sortEntries = (entries: [string, any][]) => {
        return entries.sort(([a, nodeA], [b, nodeB]) => {
            if (nodeA.type === "folder" && nodeB.type !== "folder") return -1;
            if (nodeA.type !== "folder" && nodeB.type === "folder") return 1;
            return a.localeCompare(b);
        });
    };

    return (
        <div>
            {sortEntries(Object.entries(tree)).map(([name, node]: any) => {
                const fullPath = parentPath ? `${parentPath}/${name}` : name;
                const isOpen = openFolders[fullPath];

                // 📄 FILE
                if (node.type === "file") {
                    return (
                        <div
                            key={fullPath}
                            onClick={() => setActiveFile(node.path)}
                            className={`flex items-center gap-2 px-2 py-1 text-sm cursor-pointer rounded
                ${activeFile === node.path ? "bg-white/10" : "hover:bg-white/5"}
              `}
                            style={{ paddingLeft: 8 + level * 12 }}
                        >
                            <Icon icon={getFileIcon(name)} width={14} />
                            <span className="text-xs">{name}</span>
                        </div>
                    );
                }

                // 📁 FOLDER
                return (
                    <div key={fullPath}>
                        <div
                            onClick={() =>
                                setOpenFolders((prev: any) => ({
                                    ...prev,
                                    [fullPath]: !prev[fullPath],
                                }))
                            }
                            className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-white/5 rounded"
                            style={{ paddingLeft: level * 12 }}
                        >
                            <Icon
                                icon={isOpen ? "mdi:chevron-down" : "mdi:chevron-right"}
                                width={16}
                            />
                            <span>{name}</span>
                        </div>

                        {isOpen && (
                            <FileTree
                                tree={node.children}
                                activeFile={activeFile}
                                setActiveFile={setActiveFile}
                                openFolders={openFolders}
                                setOpenFolders={setOpenFolders}
                                parentPath={fullPath}
                                level={level + 1}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
});

export default function FileSidebar({
    fileTree,
    activeFile,
    setActiveFile,
    steps,
}: any) {
    const [openFolders, setOpenFolders] = React.useState<Record<string, boolean>>(
        {}
    );
    
    useEffect(() => {
        function collectFolders(tree: any, parent = ""): string[] {
            let folders: string[] = [];

            Object.entries(tree).forEach(([name, node]: any) => {
                const fullPath = parent ? `${parent}/${name}` : name;

                if (node.type === "folder") {
                    folders.push(fullPath);
                    folders = folders.concat(collectFolders(node.children, fullPath));
                }
            });

            return folders;
        }

        const allFolders = collectFolders(fileTree);

        setOpenFolders((prev) => {
            const updated = { ...prev };

            for (const folder of allFolders) {
                if (!(folder in updated)) {
                    updated[folder] = true; // 🔥 auto-open new folders
                }
            }

            return updated;
        });
    }, [fileTree]);
    return (
        <div className="w-[35%] border border-white/10 p-3 flex flex-col">
            {/* FILE TREE */}
            <div className="flex-1 overflow-y-auto">
                <h2 className="text-sm mb-2 text-white/60">FILES</h2>

                <FileTree
                    tree={fileTree}
                    activeFile={activeFile}
                    setActiveFile={setActiveFile}
                    openFolders={openFolders}
                    setOpenFolders={setOpenFolders}
                />
            </div>

            {/* STEPS */}
            <StepsPanel steps={steps} />
        </div>
    );
}