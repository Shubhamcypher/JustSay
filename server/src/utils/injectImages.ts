export function injectImages(files: Record<string, any>, prompt: string) {

    const newFiles = { ...files };

    const keywords = prompt.toLowerCase();

    const imagePool = {
        shoe: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
            "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400"
        ],
        food: [
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
        ],
        default: [
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400"
        ]
    };

    let selected = imagePool.default;

    if (keywords.includes("shoe")) selected = imagePool.shoe;
    if (keywords.includes("food")) selected = imagePool.food;

    let index = 0;

    for (const path in newFiles) {
        let content = newFiles[path]?.content;
        if (typeof content !== "string") continue;

        content = content.replace(
            /<img[^>]*src=(\{[^}]+\}|"[^"]*")[^>]*>/g,
            () => {
                const img = selected[index % selected.length];
                index++;
                return `<img src="${img}" className="rounded-xl object-cover w-full h-48" />`;
            }
        );

        newFiles[path].content = content;
    }

    return newFiles;
}