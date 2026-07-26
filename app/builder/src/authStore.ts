let setSessionStatusFn: ((status: any) => void) | null = null;

export const authStore = {
  setSessionSetter: (fn: typeof setSessionStatusFn) => {
    setSessionStatusFn = fn;
  },

  setSessionStatus: (status: any) => {
    setSessionStatusFn?.(status);
  },
};