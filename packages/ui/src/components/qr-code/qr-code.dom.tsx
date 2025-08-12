'use dom';

import { formatHex, oklch } from 'culori';
import QR from 'qrcode';
import { useEffect, useState, useMemo, useRef } from 'react';

type QRCodeProps = {
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

const QRCode = ({
	data,
	foreground,
	background,
	robustness = 'M',
	className = '',
	style,
}: QRCodeProps) => {
	const [svg, setSVG] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Memoize color processing to avoid recalculating on every render
	const processedColors = useMemo(() => {
		const foregroundColor = foreground ?? '#1A0F2F'; // neutral-800
		const backgroundColor = background ?? '#FFFFFF';

		const foregroundOklch = getOklch(foregroundColor, [0.21, 0.006, 285.885]);
		const backgroundOklch = getOklch(backgroundColor, [0.985, 0, 0]);

		return {
			dark: formatHex(oklch({ mode: 'oklch', ...foregroundOklch })),
			light: formatHex(oklch({ mode: 'oklch', ...backgroundOklch })),
		};
	}, [foreground, background]);

	useEffect(() => {
		const generateQR = async () => {
			try {
				const newSvg = await QR.toString(data, {
					type: 'svg',
					color: processedColors,
					width: 200,
					errorCorrectionLevel: robustness,
					margin: 0,
				});

				// Safely parse and insert SVG using DOMParser
				if (containerRef.current) {
					const parser = new DOMParser();
					const doc = parser.parseFromString(newSvg, 'image/svg+xml');
					const svgElement = doc.querySelector('svg');

					if (svgElement && !doc.querySelector('parsererror')) {
						// Clear previous content
						containerRef.current.innerHTML = '';
						// Clone and append the SVG element
						containerRef.current.appendChild(svgElement.cloneNode(true));
						setSVG(newSvg);
					} else {
						console.error('QR Code generation failed: Invalid SVG');
					}
				}
			} catch (err) {
				console.error('QR Code generation failed:', err);
			}
		};

		generateQR();
	}, [data, processedColors, robustness]);

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

	return <div ref={containerRef} className={className} style={style} />;
};

export default QRCode;
