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

    // Detect file start
    const startMatch = buffer.match(/START_FILE:\s*(.+)/);

    if (startMatch && !currentFile) {
      currentFile = {
        path: startMatch[1].trim(),
        content: "",
      };

      buffer = "";
      continue;
    }

    // Collect file content
    if (currentFile) {
      currentFile.content += text;

      if (currentFile.content.includes("END_FILE")) {
        const cleanContent = currentFile.content.replace("END_FILE", "");

        await onFile({
          type: "file",
          path: currentFile.path,
          content: cleanContent,
        });

        currentFile = null;
        buffer = "";
      }
    }
  }
}