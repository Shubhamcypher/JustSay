import { useEffect, type RefObject } from "react";

export function useAutoResize<T extends HTMLElement>(ref: RefObject<T | null>, value: string) {
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
}