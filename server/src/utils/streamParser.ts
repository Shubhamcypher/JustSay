export async function parseStream(
    stream: AsyncIterable<any>,
    onFile: (file: any) => Promise<void>,
    onToken: (text: string) => void
) {
    let buffer = "";
    let currentFile: { path: string; content: string } | null = null;

    for await (const chunk of stream) {
        let text = chunk.choices?.[0]?.delta?.content || "";
        if (!text) continue;

        // 🔥 CLEAN LLM GARBAGE
        text = text
            .replace(/```[a-z]*\n?/gi, "")
            .replace(/```/g, "")
            .replace(/\*\*/g, "")
            .replace(/\r/g, "");

        // 🔥 NORMALIZE TOKENS
        text = text
            .replace(/START\s*_?\s*FILE/g, "START_FILE")
            .replace(/END\s*_?\s*FILE/g, "END_FILE");

        buffer += text;
        onToken(text);

        // 🔁 PROCESS BUFFER
        while (true) {
            // 🟢 START_FILE detection
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

                currentFile = {
                    path,
                    content: "",
                };

                buffer = afterStart.slice(newlineIndex + 1);
            }

            // 🔴 END_FILE detection (ROBUST)
            if (currentFile) {
                const endMatch = buffer.match(/END\s*_?\s*FILE/);

                // ❌ Not finished → accumulate
                if (!endMatch) {
                    currentFile.content += buffer;
                    buffer = "";
                    break;
                }

                const endIndex = buffer.indexOf(endMatch[0]);

                if (endIndex === -1) {
                    currentFile.content += buffer;
                    buffer = "";
                    break;
                }

                // ✅ File complete
                currentFile.content += buffer.slice(0, endIndex);

                await onFile({
                    type: "file",
                    path: currentFile.path,
                    content: currentFile.content.trim(),
                });

                // remove processed part
                buffer = buffer
                    .slice(endIndex + endMatch[0].length)
                    .replace(/^\s+/, ""); // 🔥 REMOVE leading junk

                currentFile = null;
            }
        }
    }

    if (currentFile && currentFile.content.length > 0) {
        console.log(currentFile);
        
        console.warn("⚠️ Incomplete file dropped:", currentFile.path);
    }
}