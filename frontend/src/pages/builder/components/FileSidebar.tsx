import React, { useEffect } from "react";
import { Icon } from "@iconify/react";


// maps file extensions to their corresponding iconify icon strings
function getFileIcon(name: string) {
    if (name.endsWith(".tsx")) return "logos:react";
    if (name.endsWith(".ts")) return "logos:typescript-icon";
    if (name.endsWith(".js")) return "logos:javascript";
    if (name.endsWith(".json")) return "vscode-icons:file-type-json";
    if (name.endsWith(".html")) return "vscode-icons:file-type-html";
    if (name.endsWith(".css")) return "vscode-icons:file-type-css";
    return "vscode-icons:default-file";
}

// Wrapped in React.memo so it only re-renders when its props actually change.
// This matters because FileTree calls itself recursively — without memo,
// opening one folder would re-render the entire tree.
const FileTree = React.memo(function FileTree({
    tree,
    activeFile,
    setActiveFile,
    openFolders,
    setOpenFolders,
    parentPath = "",
    level = 0,
}: any) {

    //for sorting folder first then files
    const sortEntries = (entries: [string, any][]) => {
        return entries.sort(([a, nodeA], [b, nodeB]) => {
            if (nodeA.type === "folder" && nodeB.type !== "folder") return -1;
            if (nodeA.type !== "folder" && nodeB.type === "folder") return 1;
            return a.localeCompare(b); //in folder files should be alphabetical order
        });
    };

    return (
        <div>
            {sortEntries(Object.entries(tree)).map(([name, node]: any) => {
                const fullPath = parentPath ? `${parentPath}/${name}` : name;
                const isOpen = openFolders[fullPath];

                //FILE
                if (node.type === "file") {
                    return (
                        <div
                            key={fullPath}
                            onClick={() => setActiveFile(node.path)}
                            className={`flex items-center gap-2 px-2 py-1 text-sm cursor-pointer rounded
                ${activeFile === node.path ? "bg-gray-600" : "hover:bg-white/5"}
              `}
                            style={{ paddingLeft: 8 + level * 12 }}
                        >
                            <Icon icon={getFileIcon(name)} width={16} />
                            <span className="text-sm">{name}</span>
                        </div>
                    );
                }



                //FOLDER
                return (
                    <div key={fullPath}>
                        <div
                            // Toggle this folder's open state in the openFolders map
                            onClick={() =>
                                setOpenFolders((prev: any) => ({
                                    ...prev,
                                    [fullPath]: !prev[fullPath], // flip true ↔ false
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
                        {/*if folder clicks and make isOpen true, make FileTree recursion of one level deeper file tree*/}
                        {isOpen && (
                            <FileTree
                                tree={node.children}  // one level deeper subtree
                                activeFile={activeFile}
                                setActiveFile={setActiveFile}
                                openFolders={openFolders}
                                setOpenFolders={setOpenFolders}
                                parentPath={fullPath} //  // e.g. "src/components" at first parentPath was "", then "src" and now "src/component"
                                level={level + 1} //to indent one step deeper
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
}: any) {
    // Tracks open/closed state for every folder, keyed by full path
    // e.g. { "src": true, "src/components": false }
    const [openFolders, setOpenFolders] = React.useState<Record<string, boolean>>(
        {}
    );

    useEffect(() => {
        // Recursively walks the tree and collects every folder's full path
        function collectFolders(tree: any, parent = ""): string[] {
            let folders: string[] = [];

            Object.entries(tree).forEach(([name, node]: any) => {
                const fullPath = parent ? `${parent}/${name}` : name;

                if (node.type === "folder") {
                    folders.push(fullPath);
                    // Recurse into children to collect nested folders too
                    folders = folders.concat(collectFolders(node.children, fullPath));
                }
            });

            return folders;
        }

        const allFolders = collectFolders(fileTree);

        setOpenFolders((prev) => {
            const updated = { ...prev };

            for (const folder of allFolders) {
                // Only auto-open folders we haven't tracked yet —
                // this preserves folders the user manually closed
                if (!(folder in updated)) {
                    updated[folder] = true;
                }
            }

            return updated;
        });
    }, [fileTree]);
    return (
        <div className="w-[35%] border border-white/10 p-3 flex flex-col custom-scrollbar">
            {/* FILE TREE */}
            <div className="flex-1 overflow-y-auto">
                <h2 className="text-sm mb-2 text-white/60">FILES</h2>
                {/* Root level render — level=0, no parentPath and fileTree is passed */}
                <FileTree
                    tree={fileTree}
                    activeFile={activeFile}
                    setActiveFile={setActiveFile}
                    openFolders={openFolders}
                    setOpenFolders={setOpenFolders}
                />
            </div>
        </div>
    );
}