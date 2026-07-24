import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function SessionHandler() {
  const { sessionStatus } = useAuth();

  const [visible, setVisible] = useState(false);

  const showTimer =useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer =useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🧠 debounce + min display logic
  useEffect(() => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    // expired / refreshing → delay show (debounce)
    if (sessionStatus === "refreshing") {
      showTimer.current = setTimeout(() => {
        setVisible(true);
      }, 500); // key debounce
    }

    // authenticated → keep visible briefly, then hide
    if (sessionStatus === "authenticated") {
      hideTimer.current = setTimeout(() => {
        setVisible(false);
      }, 500); // minimum display time
    }

    //failed → hide immediately
    if (sessionStatus === "failed") {
      setVisible(false);
    }

    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [sessionStatus]);

  const getContent = () => {
    switch (sessionStatus) {
      case "refreshing":
        return {
          title: "Logging you in",
          subtitle: "Restoring your session...",
          icon: "⏳",
        };
      case "authenticated":
        return {
          title: "Welcome back",
          subtitle: "You're good to go",
          icon: "✅",
        };
      default:
        return null;
    }
  };

  const content = getContent();

  return (
    <AnimatePresence>
      {content && visible && (
        <motion.div
          key="session-popup"
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[999]"
        >
          <div className="w-[320px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-4 text-white">
            
            <div className="flex items-center gap-3">
              <div className="text-xl">{content.icon}</div>

              <div>
                <p className="text-sm font-semibold">{content.title}</p>
                <p className="text-xs text-white/60">
                  {content.subtitle}
                </p>
              </div>
            </div>

            {/* progress bar */}
            <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}