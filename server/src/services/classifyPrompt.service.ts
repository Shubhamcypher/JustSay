// import { streamLLM } from "./ai.service"; // or however you call your LLM

// const CATEGORIES = [
//     "ecommerce",
//     "video_streaming",
//     "social_media",
//     "portfolio",
//     "blog",
//     "dashboard",
//     "landing_page",
//     "saas",
//     "food_delivery",
//     "real_estate",
//     "education",
//     "other"
// ];

// export async function classifyPrompt(prompt: string): Promise<string> {
//     const res = await fetch("https://api.openai.com/v1/chat/completions", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
//         },
//         body: JSON.stringify({
//             model: "gpt-4o-mini",
//             max_tokens: 20,
//             messages: [{
//                 role: "user",
//                 content: `Classify this website build request into exactly one category.
                
// Categories: ${CATEGORIES.join(", ")}

// Request: "${prompt}"

// Reply with only the category name, nothing else.`
//             }]
//         })
//     });

//     const data = await res.json();
//     const category = data.choices[0].message.content.trim().toLowerCase();

//     // fallback if LLM hallucinates a category
//     return CATEGORIES.includes(category) ? category : "other";
// }


//For free classify prompt
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
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Classify this website build request into exactly one category.

Categories: ${CATEGORIES.join(", ")}

Request: "${prompt}"

Reply with only the category name, nothing else.`
                        }]
                    }],
                    generationConfig: { maxOutputTokens: 20, temperature: 0 }
                })
            }
        );

        const data = await res.json();
        const category = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();

        return CATEGORIES.includes(category) ? category : "other";

    } catch (err) {
        console.error("classifyPrompt error:", err);
        return "other"; // safe fallback — never breaks generation
    }
}