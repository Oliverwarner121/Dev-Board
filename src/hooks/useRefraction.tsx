import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';

interface Options {
  /** Maximum displacement in px at the very edge. */
  scale?: number;
  /** Width in px of the bevel where the backdrop bends. */
  bevel?: number;
}

interface Size {
  width: number;
  height: number;
}

/**
 * Builds a displacement map: red encodes horizontal and green vertical
 * displacement. Both are neutral (128) in the centre and ramp to the extremes
 * across the bevel, so only the edges bend the backdrop, like a thick lens.
 */
function displacementMap({ width, height }: Size, bevel: number) {
  const bx = Math.min(bevel, width / 2);
  const by = Math.min(bevel, height / 2);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<defs>` +
    `<linearGradient id="x" gradientUnits="userSpaceOnUse" x1="0" x2="${width}" y1="0" y2="0">` +
    `<stop offset="0" stop-color="rgb(255,0,0)"/>` +
    `<stop offset="${bx / width}" stop-color="rgb(128,0,0)"/>` +
    `<stop offset="${1 - bx / width}" stop-color="rgb(128,0,0)"/>` +
    `<stop offset="1" stop-color="rgb(0,0,0)"/></linearGradient>` +
    `<linearGradient id="y" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2="${height}">` +
    `<stop offset="0" stop-color="rgb(0,255,0)"/>` +
    `<stop offset="${by / height}" stop-color="rgb(0,128,0)"/>` +
    `<stop offset="${1 - by / height}" stop-color="rgb(0,128,0)"/>` +
    `<stop offset="1" stop-color="rgb(0,0,0)"/></linearGradient></defs>` +
    `<rect width="${width}" height="${height}" fill="#000"/>` +
    `<rect width="${width}" height="${height}" fill="url(#x)"/>` +
    `<rect width="${width}" height="${height}" fill="url(#y)" style="mix-blend-mode:screen"/>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Bends the backdrop near the element's edges through an SVG displacement
 * filter. The element must be a top-level glass surface: Chromium cannot
 * sample the backdrop of an element nested inside another backdrop-filter.
 * Sets `--refract` on the element; styles.css chains it into backdrop-filter.
 * Renders nothing where the browser lacks support or the user prefers reduced
 * transparency, leaving the plain blurred glass.
 */
export function useRefraction<T extends HTMLElement>({
  scale = 36,
  bevel = 28,
}: Options = {}): [RefObject<T | null>, ReactNode] {
  const ref = useRef<T>(null);
  const id = `refract-${useId().replace(/\W/g, '')}`;
  const [size, setSize] = useState<Size | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      typeof ResizeObserver === 'undefined' ||
      !CSS.supports('backdrop-filter', 'url(#a)')
    ) {
      return;
    }
    const observer = new ResizeObserver(() => {
      const { offsetWidth: width, offsetHeight: height } = element;
      setSize((previous) =>
        previous?.width === width && previous.height === height
          ? previous
          : { width, height },
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || !size) return;
    element.style.setProperty('--refract', `url(#${id})`);
    return () => {
      element.style.removeProperty('--refract');
    };
  }, [id, size]);

  const defs =
    size && size.width > 0 && size.height > 0 ? (
      <svg
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
        style={{ position: 'absolute' }}
      >
        <filter
          id={id}
          filterUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={size.width}
          height={size.height}
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={displacementMap(size, bevel)}
            x="0"
            y="0"
            width={size.width}
            height={size.height}
            preserveAspectRatio="none"
            result="map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    ) : null;

  return [ref, defs];
}
