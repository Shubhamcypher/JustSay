export async function describeApp(
    prompt: string,
    fileList: string[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const res = await fetch(
      `http://${window.location.hostname}:5000/api/ai/describe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials:"include",
        body: JSON.stringify({
          prompt,
          fileList,
        }),
      }
    );
  
    if (!res.ok) {
      throw new Error("Failed to describe app");
    }
  
    if (!res.body) {
      throw new Error("No response body");
    }
  
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
  
    let buffer = "";
  
    while (true) {
      const { value, done } = await reader.read();
  
      if (done) break;
  
      buffer += decoder.decode(value, { stream: true });
  
      const parts = buffer.split("\n\n");
  
      for (let i = 0; i < parts.length - 1; i++) {
        const line = parts[i].replace("data: ", "").trim();
        
        if (!line || line === "[DONE]") continue;
  
        try {
          const json = JSON.parse(line);
          const chunk = json.choices?.[0]?.delta?.content;
  
          if (chunk) {
            onChunk(chunk);
          }
        } catch (err) {
          console.error(err);
        }
      }
  
      buffer = parts[parts.length - 1];
    }
  }


  export async function summarizeChanges(
    followUpPrompt: string,
    diffMap: Record<string, { added: number; removed: number }>
) {
    const res = await fetch(
        `http://${window.location.hostname}:5000/api/ai/summarize`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials:"include",
            body: JSON.stringify({
                followUpPrompt,
                diffMap,
            }),
        }
    );

    if (!res.ok) {
        throw new Error("Failed");
    }

    const data = await res.json();

    return data.summary;
}