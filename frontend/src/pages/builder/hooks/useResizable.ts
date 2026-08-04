import { useCallback, useRef, useState } from "react";

export function useResizable(initialPx: number, min: number, max: number) {
    const [size, setSize] = useState(initialPx);
    const dragging = useRef(false);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        dragging.current = true;

        const onMove = (e: MouseEvent) => {
            if (!dragging.current) return;
            setSize(prev => Math.min(max, Math.max(min, prev + e.movementX)));
        };

        const onUp = () => {
            dragging.current = false;
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }, [min, max]);

    return { size, onMouseDown };
}