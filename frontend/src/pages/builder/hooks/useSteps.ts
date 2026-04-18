import { useEffect, useRef, useState } from "react";

export type Step = {
  id: number;
  text: string;
  status: "loading" | "done";
};

export function useSteps() {
  const [steps, setSteps] = useState<Step[]>([]);
  const stepIdRef = useRef(0);

  const addStep = (text: string) => {
    const id = stepIdRef.current++;

    setSteps((prev) => {
      const active = prev.filter((s) => s.status === "loading");
      return [...active, { id, text, status: "loading" }];
    });

    return id;
  };

  const completeStep = (id: number) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "done" } : s
      )
    );
  };

  const completeStepByText = (text: string) => {
    setSteps((prev) => prev.filter((s) => s.text !== text));
  };

  // auto cleanup
  useEffect(() => {
    const timer = setInterval(() => {
      setSteps((prev) => prev.filter((s) => s.status !== "done"));
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return {
    steps,
    addStep,
    completeStep,
    completeStepByText,
  };
}