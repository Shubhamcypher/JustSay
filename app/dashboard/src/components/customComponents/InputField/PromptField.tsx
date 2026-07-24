import { useRef } from "react";
import { Mic, Send } from "lucide-react";
import { useAutoResize } from "@/hooks/useAutoResize";

type Props = {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    leftSlot?: React.ReactNode; // for AddMenu
    rightSlot?: React.ReactNode; // optional extra buttons
};

export default function PromptInput({
    placeholder,
    value,
    onChange,
    onSubmit,
    leftSlot,
    rightSlot,
}: Props) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    //auto resize hook
    useAutoResize(textareaRef, value);

    return (
        <div className="mt-4 relative group">
            {/* Glow */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 blur opacity-30 group-hover:opacity-60 transition" />

            {/* Container */}
            <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-xl min-h-40 md:min-h-48 lg:min-h-40 flex flex-col justify-between">



                {/* Textarea */}
                <div className="relative w-full">
                    {/* Fake Placeholder */}
                    {!value && (
                        <div className="absolute left-3 top-3 pointer-events-none text-xl">
                            <span className="text-white/40">Just say and </span>
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {placeholder+`|`}
                            </span>
                        </div>
                    )}

                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full resize-none bg-transparent outline-none text-xl text-white px-2 py-2 max-h-60 overflow-y-auto"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                onSubmit();
                            }
                        }}
                    />
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between mt-2">

                    {/* Left Slot */}
                    <div className="flex gap-2 text-white/60">
                        {leftSlot}
                    </div>

                    {/* Right Controls */}
                    <div className="flex gap-2">
                        {rightSlot}

                        <button className="p-2 hover:bg-white/10 rounded-lg transition">
                            <Mic size={20} />
                        </button>

                        <button
                            onClick={onSubmit}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-2xl flex items-center gap-2 hover:opacity-90 transition"
                        >
                            <Send size={20} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}