import { useEffect } from "react";

export function useAutoResize(ref: any, value: string) {
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
}