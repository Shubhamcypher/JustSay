import { useState } from "react";
import PreviewLoading from "./PreviewLoading";






export default function PreviewPane({ previewUrl, hasFiles }: any) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  return (
    <div className="w-full h-full p-2">
      {hasFiles && previewUrl ? (
        <div className="w-full h-full flex flex-col gap-2 relative">
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-2 right-2 z-10 px-3 py-1 bg-black/60 text-xs rounded"
          >
            Fullscreen
          </button>

          <iframe
            src={previewUrl}
            className="w-full h-full bg-gray-500 rounded-lg"
          />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center gap-6">
          <PreviewLoading />
        </div>
      )}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#141414] p-4">

          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-50 px-3 py-1 bg-black/60 text-xs rounded"
          >
            Exit
          </button>

          <iframe
            src={previewUrl}
            className="w-full h-full bg-gray-500 rounded-lg"
          />
        </div>
      )}
    </div>

  );
}

