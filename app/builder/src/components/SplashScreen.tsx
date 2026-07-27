type SplashScreenProps = {
  message?: string;
};

export default function SplashScreen({
  message = "Loading..."
}: SplashScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f1117]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-lg">J</span>
        </div>

        <h1 className="text-white text-xl font-semibold">
          JustSay
        </h1>

        <p className="text-white/60 mt-2">
          {message}
        </p>
      </div>
    </div>
  );
}