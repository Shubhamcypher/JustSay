import { useEffect, useRef, useState } from "react";

import {
  MonitorPlay,
  RefreshCw,
  Maximize2,
  Minimize2,
} from "lucide-react";

import PreviewLoading from "./PreviewLoading";

interface PreviewPaneProps {
  previewUrl: string | null;
  hasFiles: boolean;
}

export default function PreviewPane({ previewUrl, hasFiles }: PreviewPaneProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await previewContainerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handler);

    return () =>
      document.removeEventListener(
        "fullscreenchange",
        handler
      );
  }, []);

  const refreshPreview = () => {
    if (!iframeRef.current) return;

    const currentSrc = iframeRef.current.src;
    iframeRef.current.src = "";
    requestAnimationFrame(() => {
      if (iframeRef.current) {
        iframeRef.current.src = currentSrc;
      }
    });
  };

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
      console.debug(err);
      
    }
  };

  return (
    <div className="w-full h-full p-2">
      {hasFiles && previewUrl ? (
        <div
          ref={previewContainerRef}
          className="w-full h-full overflow-hidden rounded-xl border border-white/10 bg-[#111318] flex flex-col"
        >
          <div className="h-12 shrink-0 border-b border-white/10 bg-[#15181f] px-4 flex items-center justify-between">

            <div className="flex items-center gap-2 text-white/70">

              <MonitorPlay size={15} />

              <span className="text-sm font-medium">
                Live Preview
              </span>

            </div>

            <div className="flex items-center gap-2">

              <button
                onClick={refreshPreview}
                className="
        group
        rounded-full
        border
        border-white/10
        bg-white/[0.04]
        hover:bg-white/[0.08]
        px-4
        py-1.5
        text-white/70
        transition-all
    "
              >

                <RefreshCw
                  size={15}
                  className="group-hover:rotate-180 transition-transform duration-500"
                />

              </button>

              <button
                onClick={toggleFullscreen}
                className="
        group
        rounded-full
        border
        border-violet-500/40
        bg-violet-500/[0.06]
        hover:bg-violet-500/[0.12]
        px-4
        py-1.5
        text-violet-300
        transition-all
    "
              >

                {isFullscreen
                  ? <Minimize2 size={15} />
                  : <Maximize2 size={15} />
                }

              </button>

            </div>

          </div>
          <iframe
            ref={iframeRef}
            data-preview
            src={previewUrl}
            onLoad={handleIframeLoad}        // ← inject snapshot responder
            className="flex-1 w-full bg-[#0f1117]"
          />
        </div>
      ) : (
        <div className="w-full h-full rounded-xl border border-white/10 bg-[#111318] flex items-center justify-center">
          <PreviewLoading />
        </div>
      )}
    </div>
  );
}

