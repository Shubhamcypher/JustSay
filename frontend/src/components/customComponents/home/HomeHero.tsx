import { useState } from "react";
import AddMenu from "./AddMenu";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import PromptInput from "../InputField/PromptField";

export default function HomeHero() {
    const [prompt, setPrompt] = useState("");


    //dynamic placeholders
    const dynamicParts = [
        "create a SaaS landing page...",
        "build a portfolio for a developer...",
        "make an AI startup homepage...",
        "design a modern dashboard UI...",
    ];

    const displayDynamic = useTypingEffect(dynamicParts);

    const handleSubmit = () => {
        if (!prompt.trim()) return;
        console.log(prompt);
    };

    return (
        <div className="relative h-[80vh] flex items-center justify-center r px-4">
            <div className="relative w-[50vw] max-w-4xl text-center -z-10">

                {/* Heading */}
                <h1 className="text-6xl leading-[1.4] font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Build anything with AI
                </h1>

                <p className="text-white/60 text-xl">
                    Describe your idea and we'll generate a full website.
                </p>

                {/* Prompt field */}
                <PromptInput
                    value={prompt}
                    onChange={setPrompt}
                    onSubmit={handleSubmit}
                    placeholder={displayDynamic}
                    leftSlot={<AddMenu />}
                />
            </div>
        </div>
    );
}