'use client';

import { formatHex, oklch } from 'culori';
import QR from 'qrcode';
import * as React from 'react';
import { cn } from '@/lib/utils';

export type QRCodeProps = React.HTMLAttributes<HTMLDivElement> & {
  data: string;
  foreground?: string;
  background?: string;
  robustness?: 'L' | 'M' | 'Q' | 'H';
};

const oklchRegex = /oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\)/;

const getOklch = (color: string, fallback: [number, number, number]) => {
  const oklchMatch = color.match(oklchRegex);

  if (!oklchMatch) {
    return { l: fallback[0], c: fallback[1], h: fallback[2] };
  }

  return {
    l: Number.parseFloat(oklchMatch[1]),
    c: Number.parseFloat(oklchMatch[2]),
    h: Number.parseFloat(oklchMatch[3]),
  };
};

// Robust canvas support validation
const validateCanvasSupport = (): boolean => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return false;
    }

    // Try to create a canvas and get 2D context
    const canvas = document.createElement('canvas');
    if (!canvas) {
      return false;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return false;
    }

    // Verify essential canvas methods exist
    if (typeof ctx.fillRect !== 'function' || typeof ctx.getImageData !== 'function') {
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Canvas validation failed:', error);
    return false;
  }
};

// Validate DOM and styles are ready
const validateDOMReady = (): boolean => {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return false;
    }

    // Check if document is in a ready state
    if (document.readyState === 'loading') {
      return false;
    }

    // Try to access computed styles
    const styles = getComputedStyle(document.documentElement);
    if (!styles) {
      return false;
    }

    return true;
  } catch (error) {
    console.warn('DOM validation failed:', error);
    return false;
  }
};

export const QRCode = ({
  data,
  foreground,
  background,
  robustness = 'M',
  className,
  ...props
}: QRCodeProps) => {
  const [svg, setSVG] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isReady, setIsReady] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Check environment readiness
  React.useEffect(() => {
    const checkReadiness = () => {
      const canvasSupported = validateCanvasSupport();
      const domReady = validateDOMReady();
      
      if (canvasSupported && domReady) {
        setIsReady(true);
        setError(null);
      } else {
        setIsReady(false);
        if (!canvasSupported) {
          setError('Canvas not supported in this environment');
        } else if (!domReady) {
          setError('DOM not ready');
        }
      }
    };

    // Initial check
    checkReadiness();

    // If DOM is still loading, wait for ready state
    if (document.readyState === 'loading') {
      const handleDOMReady = () => {
        setTimeout(checkReadiness, 0); // Next tick after DOM ready
      };
      
      document.addEventListener('DOMContentLoaded', handleDOMReady);
      return () => document.removeEventListener('DOMContentLoaded', handleDOMReady);
    }
  }, []);

  // Generate QR code when ready
  React.useEffect(() => {
    if (!isReady || !data) {
      return;
    }

    const generateQR = async () => {
      try {
        setError(null);

        const styles = getComputedStyle(document.documentElement);
        const foregroundColor =
          foreground ?? styles.getPropertyValue('--foreground');
        const backgroundColor =
          background ?? styles.getPropertyValue('--background');

        const foregroundOklch = getOklch(
          foregroundColor,
          [0.21, 0.006, 285.885]
        );
        const backgroundOklch = getOklch(backgroundColor, [0.985, 0, 0]);

        const newSvg = await QR.toString(data, {
          type: 'svg',
          color: {
            dark: formatHex(oklch({ mode: 'oklch', ...foregroundOklch })),
            light: formatHex(oklch({ mode: 'oklch', ...backgroundOklch })),
          },
          width: 200,
          errorCorrectionLevel: robustness,
          margin: 0,
        });

        setSVG(newSvg);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('QR Code generation error:', err);
        setError(`Failed to generate QR code: ${errorMessage}`);
        setSVG(null);
      }
    };

    void generateQR();
  }, [isReady, data, foreground, background, robustness]);

  // Error fallback
  if (error) {
    return (
      <div
        ref={containerRef}
        className={cn('flex items-center justify-center p-4 border border-dashed border-gray-300 rounded', className)}
        {...props}
      >
        <div className="text-center text-sm text-gray-500">
          <div>QR Code unavailable</div>
          <div className="text-xs mt-1">Data: {data}</div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!svg || !isReady) {
    return (
      <div
        ref={containerRef}
        className={cn('flex items-center justify-center p-4 border border-gray-200 rounded', className)}
        {...props}
      >
        <div className="text-center text-sm text-gray-400">
          <div>Generating QR code...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('size-full', '[&_svg]:size-full', className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required for SVG"
      dangerouslySetInnerHTML={{ __html: svg }}
      {...props}
    />
  );
};
