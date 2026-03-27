import { useEffect, useState } from "react";

export function useTypingEffect(dynamicParts: string[]) {
  const [display, setDisplay] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const current = dynamicParts[phraseIndex];
    const speed = isDeleting ? 20 : 30;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplay(current.slice(0, charIndex + 1));
        setCharIndex((p) => p + 1);

        if (charIndex === current.length) {
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        setDisplay(current.slice(0, charIndex - 1));
        setCharIndex((p) => p - 1);

        if (charIndex === 0) {
          setIsDeleting(false);
          setPhraseIndex((p) => (p + 1) % dynamicParts.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  return display;
}