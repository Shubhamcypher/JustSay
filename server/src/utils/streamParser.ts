type ParsedFile = {
  type: "file";
  path: string;
  content: string;
};

export async function parseStream(
  stream: AsyncIterable<any>,
  onFile: (file: ParsedFile) => Promise<void>,
  onToken: (text: string) => void
) {
  let buffer = "";
  let currentFile: { path: string; content: string } | null = null;

  for await (const chunk of stream) {
    const text = chunk.choices?.[0]?.delta?.content || "";
    if (!text) continue;

    onToken(text); // ✅ REAL streaming (no batching)

    buffer += text;

    while (true) {
      // START_FILE detection
      const startIdx = buffer.indexOf("START_FILE:");
      const endIdx = buffer.indexOf("END_FILE");

      if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) break;

      const fileBlock = buffer.slice(startIdx, endIdx + "END_FILE".length);

      // extract path
      const pathMatch = fileBlock.match(/START_FILE:\s*(.+)/);
      const path = pathMatch?.[1]?.trim();

      // extract content
      const content = fileBlock
        .replace(/START_FILE:.+\n/, "")
        .replace(/END_FILE/, "")
        .trim();

      if (path) {
        await onFile({
          type: "file",
          path,
          content,
        });
      }

      buffer = buffer.slice(endIdx + "END_FILE".length);
    }
  }
}