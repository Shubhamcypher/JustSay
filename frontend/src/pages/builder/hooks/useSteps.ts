import { useRef, useState } from "react";

export type Step = {
  id: number;
  text: string;
  status: "loading" | "done";
};

export function useSteps() {
  const [steps, setSteps] = useState<Step[]>([]);
  const stepIdRef = useRef(0);

  const addStep = (text: string, group = "general") => {
    const id = stepIdRef.current++;
  
    setSteps((prev) => [
      ...prev,
      { id, text, status: "loading", group },
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