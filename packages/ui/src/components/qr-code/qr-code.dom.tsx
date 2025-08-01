'use dom';

import { formatHex, oklch } from 'culori';
import QR from 'qrcode';
import { useEffect, useState } from 'react';

export type QRCodeProps = {
  data: string;
  foreground?: string;
  background?: string;
  robustness?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
  style?: React.CSSProperties;
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

export const QRCode = ({
  data,
  foreground,
  background,
  robustness = 'M',
  className = '',
  style,
}: QRCodeProps) => {
  const [svg, setSVG] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Use provided colors or fallback to RITE brand colors
        const foregroundColor = foreground ?? '#1A0F2F'; // neutral-800
        const backgroundColor = background ?? '#FFFFFF';

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
        console.error('QR Code generation failed:', err);
      }
    };

    generateQR();
  }, [data, foreground, background, robustness]);

  if (!svg) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`} 
        style={{ width: 200, height: 200, ...style }}
      >
        <span>Loading QR...</span>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};