import * as React from 'react';
import {
	H1,
	H2,
	H3,
	H4,
	H5,
	H6,
	Body,
	BodyLarge,
	BodySmall,
	Caption,
	TextLabel,
	type TextProps,
} from '../text';

// Map old Typography variant prop to new components
const variantToComponent = {
	h1: H1,
	h2: H2,
	h3: H3,
	h4: H4,
	h5: H5,
	h6: H6,
	body: Body,
	'body-lg': BodyLarge,
	'body-sm': BodySmall,
	caption: Caption,
	label: TextLabel,
	button: Body, // Map button variant to Body with appropriate styling
} as const;

type TypographyVariant = keyof typeof variantToComponent;

export interface TypographyProps extends Omit<TextProps, 'variant' | 'color'> {
	variant?: TypographyVariant;
	color?: 'default' | 'secondary' | 'muted' | 'primary' | 'error' | 'success';
	children: React.ReactNode;
}

/**
 * Typography adapter component for backward compatibility
 * Maps old Typography API to new NativeWind text components
 */
export const Typography = React.forwardRef<any, TypographyProps>(
	({ variant = 'body', color = 'default', className, ...props }, ref) => {
		const Component = variantToComponent[variant] || Body;

		// Map color names (some are slightly different)
		const mappedColor =
			color === 'secondary'
				? 'secondary'
				: color === 'muted'
					? 'muted'
					: color === 'primary'
						? 'primary'
						: color === 'error'
							? 'error'
							: color === 'success'
								? 'success'
								: 'default';

		return <Component ref={ref} color={mappedColor as any} className={className} {...props} />;
	}
);

Typography.displayName = 'Typography';
