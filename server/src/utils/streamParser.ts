export async function parseStream(
  stream: AsyncIterable<any>,
  onFile: (file: any) => Promise<void>,
  onToken: (text: string) => void
) {
  let buffer = "";
  let currentFile: { path: string; content: string } | null = null;

  for await (const chunk of stream) {
    const text = chunk.choices?.[0]?.delta?.content || "";
    if (!text) continue;

    buffer += text;
    onToken(text);

    while (true) {
      // 🔹 START_FILE detection
      if (!currentFile) {
        const startIndex = buffer.indexOf("START_FILE:");

        if (startIndex === -1) break;

        const afterStart = buffer.slice(startIndex + "START_FILE:".length);

        const newlineIndex = afterStart.indexOf("\n");

        if (newlineIndex === -1) break; // wait for full path

        const path = afterStart.slice(0, newlineIndex).trim();

        currentFile = { path, content: "" };

        buffer = afterStart.slice(newlineIndex + 1);
      }

      // 🔹 END_FILE detection
      if (currentFile) {
        const endIndex = buffer.indexOf("END_FILE");

        if (endIndex === -1) {
          currentFile.content += buffer;
          buffer = "";
          break;
        }

        // complete file
        currentFile.content += buffer.slice(0, endIndex);

        await onFile({
          type: "file",
          path: currentFile.path,
          content: currentFile.content.trim(),
        });

        buffer = buffer.slice(endIndex + "END_FILE".length);
        currentFile = null;
      }
    }
  }
}