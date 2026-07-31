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