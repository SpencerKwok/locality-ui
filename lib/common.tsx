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
    const handleResize = (): void => {
      const isMobile =
        /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      if (isMobile) {
        const isPortrait =
          screen.orientation.type === "portrait-primary" ||
          screen.orientation.type === "portrait-secondary";
        setWindowSize({
          width: isPortrait ? screen.availWidth : screen.availHeight,
          height: isPortrait ? screen.availHeight : screen.availWidth,
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
