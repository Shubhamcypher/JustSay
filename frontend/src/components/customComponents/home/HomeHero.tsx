import { useState } from "react";
import AddMenu from "./AddMenu";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import PromptInput from "../InputField/PromptField";

export default function HomeHero() {
    const [prompt, setPrompt] = useState("");

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
        <div className="relative min-h-[60vh] md:h-[80vh] flex md:items-center justify-center px-4 md:px-0 pt-6 md:pt-6 items-center -z-10">

            <div className="relative w-full md:w-[100vw] md:p-6 max-w-4xl text-center">

                {/* Heading */}
                <h1 className="text-[32px] md:text-6xl lg:text-5xl leading-[1.6] md:leading-[1.6] lg:leading-[1.3] font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent bg-red-500">
                    Build anything with AI
                </h1>

                {/* Prompt */}
                <div className="lg:px-16 md:px-8">
                    <PromptInput
                        value={prompt}
                        onChange={setPrompt}
                        onSubmit={handleSubmit}
                        placeholder={displayDynamic}
                        leftSlot={<AddMenu />}
                    />
                </div>

            </div>
        </div>
    );
}