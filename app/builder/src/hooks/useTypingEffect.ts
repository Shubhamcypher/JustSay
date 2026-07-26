import { useEffect, useState } from "react";

export function useTypingEffect(dynamicParts: string[]) {
  const [displayDynamic, setDisplayDynamic] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [charIndex, setCharIndex] = useState(0);
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        //current keeps the different dynamic placeholders
        const current = dynamicParts[phraseIndex];
        const speed = isDeleting ? 20 : 30;

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                //at every charIndex+1 dynamic text adds new character of dynamicParts
                setDisplayDynamic(current.slice(0, charIndex + 1));
                setCharIndex((prev) => prev + 1); //charIndex increases by 1

                //if completed writing one placeholder pause and make deleting true
                if (charIndex === current.length) {
                    setTimeout(() => setIsDeleting(true), 1200);
                }
            } else { //if is deleting is true
                //at every charIndex-11 dynamic text removes current character from current
                setDisplayDynamic(current.slice(0, charIndex - 1));
                setCharIndex((prev) => prev - 1); //charIndex decreases by 1

                if (charIndex === 0) { //while deleting charIndex ===0 means last character of the string
                    setIsDeleting(false); //make deleting false
                    setPhraseIndex((prev) => (prev + 1) % dynamicParts.length); //increase phrase index, using modulo to round bot to value 0-3(dynamicParts.length)
                    setDisplayDynamic("");
                    return; //prevent extra render cycle
                }
            }
        }, speed);

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, phraseIndex]);

  return displayDynamic;
}