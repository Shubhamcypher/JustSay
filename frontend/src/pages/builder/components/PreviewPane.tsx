export default function PreviewPane({ previewUrl, hasFiles }: any) {
    return (
      <div className="w-[50%] p-2">
        {hasFiles && previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full bg-gray-500 rounded-lg"
          />
        ) : (
          <div className="text-white/50 text-sm">
            Starting preview...
          </div>
        )}
      </div>
    );
  }