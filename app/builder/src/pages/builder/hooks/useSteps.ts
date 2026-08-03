import type { Step } from "@shared/types";
import { useRef, useState } from "react";


export function useSteps() {
  const [steps, setSteps] = useState<Step[]>([]);
  const stepIdRef = useRef(0);

  const addStep = (
    loadingText: string,
    completedText: string,
    group = "general"
  ) => {
    const id = stepIdRef.current++;

    

    setSteps((prev) => [
      ...prev,
      {
        id,
        loadingText,
        completedText,
        status: "loading",
        group,
      },
    ]);

    return id;
  };

  const completeStep = (id: number) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "done" } : s
      )
    );
  };





  return {
    steps,
    addStep,
    completeStep,
  };
}