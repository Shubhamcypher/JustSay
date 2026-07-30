import { Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  previewUrl: string | null;
};

export default function ProjectFrame({
  previewUrl,
}: Props) {

  const [loaded, setLoaded] = useState(false);

  if (!previewUrl) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0b0b0b]">

        <div className="flex flex-col items-center gap-4">

          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />

          <p className="text-white/70">
            Starting preview...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="flex-1 relative bg-[#0b0b0b]">

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0b0b0b] z-10">

          <div className="flex flex-col items-center gap-4">

            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />

            <p className="text-white/70">
              Launching application...
            </p>

          </div>

        </div>
      )}

      <iframe
        data-preview
        src={previewUrl}
        onLoad={() => setLoaded(true)}
        className="w-full h-full border-0"
      />

    </div>
  );
}