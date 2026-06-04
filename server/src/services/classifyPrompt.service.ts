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

import Groq from "groq-sdk";

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
    "other",
    undefined
];



const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});





export async function classifyPrompt(prompt: string): Promise<string> {
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            max_tokens: 10,
            messages: [
                {
                    role: "system",
                    content: `You are a website classifier.

Valid categories:
${CATEGORIES.join(", ")}

Return ONLY one category from the list.
No explanations.
No punctuation.
No extra text.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        const raw = completion.choices[0]?.message?.content
            ?.trim()
            .toLowerCase();

        console.log("Groq response:", raw);

        return raw && CATEGORIES.includes(raw)
            ? raw
            : "other";

    } catch (error) {
        console.error("classifyPrompt error:", error);
        return "other";
    }
}