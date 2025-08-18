import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './button.web';

describe('Button Component', () => {
	it('renders correctly with default props', () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole('button', { name: 'Click me' });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
	});

	it('applies variant classes correctly', () => {
		render(<Button variant="destructive">Delete</Button>);
		const button = screen.getByRole('button', { name: 'Delete' });
		expect(button).toHaveClass('bg-error');
	});

	it('applies size classes correctly', () => {
		render(<Button size="sm">Small Button</Button>);
		const button = screen.getByRole('button', { name: 'Small Button' });
		expect(button).toHaveClass('h-10', 'rounded-md', 'px-4', 'py-2', 'text-sm');
	});

	it('applies large size classes correctly', () => {
		render(<Button size="lg">Large Button</Button>);
		const button = screen.getByRole('button', { name: 'Large Button' });
		expect(button).toHaveClass('h-14', 'rounded-xl', 'px-8', 'py-4', 'text-lg');
	});

	it('handles click events', () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Click me</Button>);
		const button = screen.getByRole('button', { name: 'Click me' });
		
		fireEvent.click(button);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('is disabled when disabled prop is true', () => {
		render(<Button disabled>Disabled Button</Button>);
		const button = screen.getByRole('button', { name: 'Disabled Button' });
		expect(button).toBeDisabled();
		expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
	});

	it('forwards ref correctly', () => {
		const ref = React.createRef<HTMLButtonElement>();
		render(<Button ref={ref}>Button with ref</Button>);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});

	it('applies custom className', () => {
		render(<Button className="custom-class">Custom Button</Button>);
		const button = screen.getByRole('button', { name: 'Custom Button' });
		expect(button).toHaveClass('custom-class');
	});

	it('renders all variant types without errors', () => {
		const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
		
		variants.forEach((variant) => {
			render(<Button variant={variant}>{variant} Button</Button>);
			const button = screen.getByRole('button', { name: `${variant} Button` });
			expect(button).toBeInTheDocument();
		});
	});

	it('renders all size types without errors', () => {
		const sizes = ['default', 'sm', 'lg', 'icon'] as const;
		
		sizes.forEach((size) => {
			render(<Button size={size}>{size} Button</Button>);
			const button = screen.getByRole('button', { name: `${size} Button` });
			expect(button).toBeInTheDocument();
		});
	});

	it('has correct accessibility attributes', () => {
		render(<Button aria-label="Accessible button">Button</Button>);
		const button = screen.getByRole('button', { name: 'Accessible button' });
		expect(button).toHaveAttribute('aria-label', 'Accessible button');
	});

	it('applies focus styles correctly', () => {
		render(<Button>Focus Button</Button>);
		const button = screen.getByRole('button', { name: 'Focus Button' });
		expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-brand-primary');
	});
});