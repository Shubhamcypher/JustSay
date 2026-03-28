type Props = {
    visible: boolean;
    top: number;
    left: number;
    content: React.ReactNode;
  };
  
  export default function HoverPreview({ visible, top, left, content }: Props) {
    if (!visible) return null;
  
    return (
      <div
        style={{ top, left }}
        className="fixed z-[999] pointer-events-none transition-all duration-150"
      >
        <div className="w-[420px] h-[260px] bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {content}
        </div>
      </div>
    );
  }