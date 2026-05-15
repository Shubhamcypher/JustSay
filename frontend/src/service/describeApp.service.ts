export async function describeApp(
    prompt: string,
    fileList: string[],
    onChunk: (chunk: string) => void
): Promise<void> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            max_tokens: 120,
            stream: true,   // ← key change
            messages: [{
                role: "user",
                content: `The user asked: "${prompt}".
You just built a React app with these files: ${fileList.join(", ")}.
Write 2-3 sentences describing what you built, what key features it has, and the design style.
Be specific, natural, first-person. No fluff.`
            }]
        })
    });

    const reader = res.body!.getReader();
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
                const chunk = json.choices[0]?.delta?.content;
                if (chunk) onChunk(chunk);
            } catch {}
        }

        buffer = parts[parts.length - 1];
    }
}