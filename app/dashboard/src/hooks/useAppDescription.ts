import { useEffect, useState } from "react";
import { describeApp } from "@/service/describeApp.service";

export function useAppDescription(
    url: string | null,
    prompt: string,
    files: Record<string, any>
): string[] {
    const [lines, setLines] = useState<string[]>([]);

    useEffect(() => {
        if (!url || !prompt) return;

        const fileList = Object.keys(files);

        describeApp(prompt, fileList, (chunk:string) => {
            setLines(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1] ?? "";
                const combined = last + chunk;

                // if chunk contains a period, split into new line
                if (combined.includes(".")) {
                    const parts = combined.split(/(?<=\.)\s*/); // split after period
                    updated[updated.length === 0 ? 0 : updated.length - 1] = parts[0];
                    for (let i = 1; i < parts.length; i++) {
                        if (parts[i]) updated.push(parts[i]);
                    }
                } else {
                    if (updated.length === 0) updated.push(combined);
                    else updated[updated.length - 1] = combined;
                }

                return updated;
            });
        }).catch(() => setLines(["Your app is ready to explore!"]));

    }, [url]);

    return lines;
}