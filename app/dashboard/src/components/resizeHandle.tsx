type Props = {
    onMouseDown: (e: React.MouseEvent) => void;
};

export default function ResizeHandle({ onMouseDown }: Props) {
    return (
        <div
            onMouseDown={onMouseDown}
            className="w-[4px] shrink-0 cursor-col-resize group relative z-10"
        >
            <div className="absolute inset-y-0 left-[1px] w-[2px] bg-white/[0.06] group-hover:bg-violet-500/50 group-active:bg-violet-500 transition-colors duration-150" />
        </div>
    );
}