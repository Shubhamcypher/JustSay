import { streamLLM } from "./ai.service"; // or however you call your LLM

const CATEGORIES = [
    "ecommerce",
    "video_streaming",
    "social_media",
    "portfolio",
    "blog",
    "dashboard",
    "landing_page",
    "saas",
    "food_delivery",
    "real_estate",
    "education",
    "other"
];

export async function classifyPrompt(prompt: string): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            max_tokens: 20,
            messages: [{
                role: "user",
                content: `Classify this website build request into exactly one category.
                
Categories: ${CATEGORIES.join(", ")}

Request: "${prompt}"

Reply with only the category name, nothing else.`
            }]
        })
    });

    const data = await res.json();
    const category = data.choices[0].message.content.trim().toLowerCase();

    // fallback if LLM hallucinates a category
    return CATEGORIES.includes(category) ? category : "other";
}