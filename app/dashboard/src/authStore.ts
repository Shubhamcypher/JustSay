import type { SessionStatus } from "@shared/types";

let setSessionStatusFn: ((status: SessionStatus) => void) | null = null;

export const authStore = {
  setSessionSetter: (fn: typeof setSessionStatusFn) => {
    setSessionStatusFn = fn;
  },

  setSessionStatus: (status: SessionStatus) => {
    setSessionStatusFn?.(status);
  },
};