import { log } from "console";

type ParsedFile = {
    path: string;
    content: string;
};

export async function parseStream(
    stream: AsyncIterable<any>,
    onFile: (file: { type: "file"; path: string; content: string }) => Promise<void>,
    onToken: (text: string) => void
) {
    let buffer = "";
    let currentFile: ParsedFile | null = null;

    for await (const chunk of stream) {
        let text = chunk.choices?.[0]?.delta?.content || "";

        if (text) {
            // 🔥 CLEAN + NORMALIZE (CRITICAL FIX)
            text = text
                .replace(/```[a-z]*\n?/gi, "")
                .replace(/```/g, "")
                .replace(/\*\*/g, "")
                .replace(/\r/g, "")
                .replace(/START\s*_?\s*FILE/g, "START_FILE")
                .replace(/END\s*_?\s*FILE/g, "END_FILE")

                // 🔥 HANDLE BROKEN TOKENS
                .replace(/\(\s*END_FILE/g, "END_FILE")
                .replace(/\(\s*START_FILE/g, "START_FILE")
                .replace(/END_FILE\)/g, "END_FILE")
                .replace(/START_FILE\)/g, "START_FILE");

            buffer += text;
            // onToken(text);
        }

        // 🔁 PROCESS BUFFER
        while (true) {
            // 🟢 START_FILE
            if (!currentFile) {
                const startMatch = buffer.match(/START_FILE:\s*([^\n]+)/);
                if (!startMatch) break;

                const fullMatch = startMatch[0];
                const path = startMatch[1].trim();

                const startIndex = buffer.indexOf(fullMatch);
                if (startIndex === -1) break;

                const afterStart = buffer.slice(startIndex + fullMatch.length);
                const newlineIndex = afterStart.indexOf("\n");
                if (newlineIndex === -1) break;

                currentFile = { path, content: "" };
                buffer = afterStart.slice(newlineIndex + 1).trimStart();
            }

            // 🔴 FILE PROCESSING
            if (currentFile) {
                const file = currentFile;

                const endMatch = buffer.match(/END_FILE/);
                const nextStart = buffer.indexOf("START_FILE:");

                // 🚨 CASE 1: START_FILE appears before END_FILE → FIX BROKEN OUTPUT
                // if (
                //   nextStart !== -1 &&
                //   (!endMatch || nextStart < buffer.indexOf(endMatch[0]))
                // ) {
                //   file.content += buffer.slice(0, nextStart);

                //   await onFile({
                //     type: "file",
                //     path: file.path,
                //     content: file.content.trim(),
                //   });

                //   buffer = buffer.slice(nextStart).trimStart();
                //   currentFile = null;
                //   continue;
                // }

                // ❌ No END_FILE yet
                // if (!endMatch) {
                //     file.content += buffer;
                //     buffer = "";
                //     break;
                // }

                const SAFE_TAIL = 10;

                if (!endMatch) {
                    if (buffer.length > SAFE_TAIL) {
                        file.content += buffer.slice(0, -SAFE_TAIL);
                        buffer = buffer.slice(-SAFE_TAIL); // keep tail for next chunk
                    }
                    break;
                }

                const endIndex = buffer.indexOf(endMatch[0]);
                // if (endIndex === -1) {
                //     file.content += buffer;
                //     buffer = "";
                //     break;
                // }
                if (endIndex === -1) {
                    if (buffer.length > SAFE_TAIL) {
                        file.content += buffer.slice(0, -SAFE_TAIL);
                        buffer = buffer.slice(-SAFE_TAIL);
                    }
                    break;
                }

                // ✅ NORMAL COMPLETE FILE
                file.content += buffer.slice(0, endIndex);

                await onFile({
                    type: "file",
                    path: file.path,
                    content: file.content.trim(),
                });

                buffer = buffer
                    .slice(endIndex + endMatch[0].length)
                    .trimStart();

                currentFile = null;
                continue;
            }
        }
        if (!currentFile && buffer.trim() && !buffer.includes("START_FILE")) {
            onToken(buffer);
            buffer = "";
        }
    }

    // =========================
    // 🧠 FINAL DRAIN (IMPORTANT)
    // =========================
    while (true) {
        if (!currentFile) break;

        const endIndex = buffer.indexOf("END_FILE");
        if (endIndex === -1) break;

        const file = currentFile;

        file.content += buffer.slice(0, endIndex);

        await onFile({
            type: "file",
            path: file.path,
            content: file.content.trim(),
        });

        buffer = buffer.slice(endIndex + "END_FILE".length).trimStart();
        currentFile = null;
    }

    // 🚨 TRUE incomplete only
    if (currentFile) {
        console.warn("⚠️ Incomplete file dropped:", currentFile.path);
        console.log(currentFile)
        await onFile({
            type: "file",
            path: currentFile.path,
            content: currentFile.content.trim(),
        });
    }

}