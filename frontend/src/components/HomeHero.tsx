import { useEffect, useRef, useState } from "react";
import { Mic, Image, Paperclip, Send } from "lucide-react";

export default function HomeHero() {
    const [prompt, setPrompt] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    //Static text for dynamic placeholder
    const staticText = "Just say and we will ";

    //dynamic placeholders
    const dynamicParts = [
        "Create a SaaS landing page...",
        "Build a portfolio for a developer...",
        "Make an AI startup homepage...",
        "Design a modern dashboard UI...",
    ];

    //Typing effect
    const [displayDynamic, setDisplayDynamic] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [charIndex, setCharIndex] = useState(0);
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        //current keeps the different dynamic placeholders
        const current = dynamicParts[phraseIndex];
        const speed = isDeleting ? 30 : 60;

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                //at every charIndex+1 dynamic text adds new character of dynamicParts
                setDisplayDynamic(current.slice(0, charIndex + 1));
                setCharIndex((prev) => prev + 1); //charIndex increases by 1

                //if completed writing one placeholder pause and make deleting true
                if (charIndex === current.length) {
                    setTimeout(() => setIsDeleting(true), 1200);
                }
            } else { //if is deleting is true
                //at every charIndex-11 dynamic text removes current character from current
                setDisplayDynamic(current.slice(0, charIndex - 1));
                setCharIndex((prev) => prev - 1); //charIndex decreases by 1

                if (charIndex === 0) { //while deleting charIndex ===0 means last character of the string
                    setIsDeleting(false); //make deleting false
                    setPhraseIndex((prev) => (prev + 1) % dynamicParts.length); //increase phrase index, using modulo to round bot to value 0-3(dynamicParts.length)
                    setDisplayDynamic("");
                    return; //prevent extra render cycle
                }
            }
        }, speed);

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, phraseIndex]);

    // Auto grow
    const handleInput = (e: any) => {
        setPrompt(e.target.value);

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                textareaRef.current.scrollHeight + "px";
        }
    };

    const handleSubmit = () => {
        if (!prompt.trim()) return;
        console.log(prompt);
    };

    return (
        <div className="relative h-[80vh] flex items-center justify-center px-4">


            <div className="relative w-full max-w-2xl text-center">

                {/* Heading */}
                <h1 className="text-6xl leading-[1.4] font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Build anything with AI
                </h1>

                <p className="text-white/60 text-xl">
                    Describe your idea and we’ll generate a full website.
                </p>

                {/* 💎 Premium Input */}
                <div className="mt-10 relative group">

                    {/* Glow border */}
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 blur opacity-30 group-hover:opacity-60 transition" />

                    <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-xl">

                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={prompt}
                            onChange={handleInput}
                            placeholder={staticText + displayDynamic + "|"} className="w-full resize-none bg-transparent outline-none text-white placeholder:text-white/40 px-2 py-2 max-h-40 overflow-y-auto"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />

                        {/* Bottom Controls */}
                        <div className="flex items-center justify-between mt-2">

                            <div className="flex gap-2 text-white/60">

                                <button className="p-2 hover:bg-white/10 rounded-lg transition">
                                    <Paperclip size={18} />
                                </button>

                                <button className="p-2 hover:bg-white/10 rounded-lg transition">
                                    <Image size={18} />
                                </button>

                                <button className="p-2 hover:bg-white/10 rounded-lg transition">
                                    <Mic size={18} />
                                </button>

                            </div>

                            <button
                                onClick={handleSubmit}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition"
                            >
                                <Send size={16} />
                                Generate
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}