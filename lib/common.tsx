import { useState, useCallback, useEffect } from "react";

export function useMediaQuery(
  length: number,
  dimension: "height" | "width"
): boolean {
  const [targetReached, setTargetReached] = useState(false);

  const updateTarget = useCallback((e: MediaQueryListEvent) => {
    if (e.matches) {
      setTargetReached(true);
    } else {
      setTargetReached(false);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia(`(max-${dimension}: ${length}em)`);
    media.addEventListener("change", (e) => {
      updateTarget(e);
    });

    if (media.matches) {
      setTargetReached(true);
    }

    return (): void => {
      media.removeEventListener("change", (e) => {
        updateTarget(e);
      });
    };
  }, []);

  return targetReached;
}

export function useWindowSize(): { height?: number; width?: number } {
  const [windowSize, setWindowSize] = useState({
    width: undefined as number | undefined,
    height: undefined as number | undefined,
  });

  useEffect(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    const handleResize = (): void => {
      if (isMobile) {
        const isPortrait =
          window.orientation === 0 || window.orientation === 180;
        setWindowSize({
          width: isPortrait
            ? screen.availWidth || screen.width
            : screen.availHeight || screen.height,
          height: isPortrait
            ? screen.availHeight || screen.height
            : screen.availWidth || screen.width,
        });
      } else {
        setWindowSize({
          width: document.body.clientWidth,
          height: document.body.clientHeight,
        });
      }
    };

    // Initialize window size on mount
    handleResize();

    // Handle window + document resize
    window.addEventListener("resize", handleResize);
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(document.body);

    return (): void => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  return windowSize;
}
