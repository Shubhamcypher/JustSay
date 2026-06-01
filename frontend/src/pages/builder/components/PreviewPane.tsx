import { useState } from "react";
import PreviewLoading from "./PreviewLoading";

export default function PreviewPane({ previewUrl, hasFiles }: any) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      const iframe = e.currentTarget;
      const doc = iframe.contentDocument;
      if (!doc) return;

      // Inject listener into the iframe page
      const script = doc.createElement('script');
      script.textContent = `
        window.addEventListener('message', function(e) {
          if (e.data && e.data.type === 'REQUEST_SNAPSHOT') {
            e.source.postMessage({
              type: 'SNAPSHOT_HTML',
              html: document.documentElement.outerHTML
            }, '*');
          }
        });
      `;
      doc.head?.appendChild(script);
    } catch (err) {
      // cross-origin — silently skip
    }
  };

  return (
    <div className="w-full h-full p-2">
      {hasFiles && previewUrl ? (
        <div className="w-full h-full flex flex-col gap-2 relative">
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-[-48px] right-4 z-10 px-3 py-2 bg-black/60 text-sm rounded"
          >
            Fullscreen
          </button>
          <iframe
            data-preview
            src={previewUrl}
            onLoad={handleIframeLoad}        // ← inject snapshot responder
            className="w-full h-full bg-gray-500 rounded-lg"
          />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center gap-6">
          <PreviewLoading />
        </div>
      )}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#141414] p-2">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-16 z-50 px-3 py-1 bg-black/60 text-lg rounded"
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

