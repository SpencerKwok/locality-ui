import { useState, useCallback, useEffect } from "react";

export function useMediaQuery(length: number, dimension: "height" | "width") {
  const [targetReached, setTargetReached] = useState(false);

  const updateTarget = useCallback((e) => {
    if (e.matches) {
      setTargetReached(true);
    } else {
      setTargetReached(false);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia(`(max-${dimension}: ${length}em)`);
    media.addEventListener("change", (e) => updateTarget(e));

    if (media.matches) {
      setTargetReached(true);
    }

    return () => media.removeEventListener("change", (e) => updateTarget(e));
  }, []);

  return targetReached;
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined as number | undefined,
    height: undefined as number | undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: document.body.clientWidth,
        height: document.body.clientHeight,
      });
    };

    // Initialize window size on mount
    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(document.body);

    return () => resizeObserver.unobserve(document.body);
  }, []);

  return windowSize;
}
