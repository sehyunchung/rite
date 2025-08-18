import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './input.web';

describe('Input Component', () => {
	it('renders correctly with default props', () => {
		render(<Input placeholder="Enter text" />);
		const input = screen.getByPlaceholderText('Enter text');
		expect(input).toBeInTheDocument();
		expect(input).toHaveClass('flex', 'h-12', 'w-full', 'rounded-lg', 'border', 'border-border');
	});

	it('applies custom className', () => {
		render(<Input className="custom-input" placeholder="Test input" />);
		const input = screen.getByPlaceholderText('Test input');
		expect(input).toHaveClass('custom-input');
	});

	it('forwards ref correctly', () => {
		const ref = React.createRef<HTMLInputElement>();
		render(<Input ref={ref} placeholder="Ref input" />);
		expect(ref.current).toBeInstanceOf(HTMLInputElement);
	});

	it('handles value changes', () => {
		const handleChange = vi.fn();
		render(<Input onChange={handleChange} placeholder="Change test" />);
		const input = screen.getByPlaceholderText('Change test');
		
		fireEvent.change(input, { target: { value: 'new value' } });
		expect(handleChange).toHaveBeenCalledTimes(1);
	});

	it('can be disabled', () => {
		render(<Input disabled placeholder="Disabled input" />);
		const input = screen.getByPlaceholderText('Disabled input');
		expect(input).toBeDisabled();
		expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
	});

	it('supports different input types', () => {
		render(<Input type="email" placeholder="Email input" />);
		const input = screen.getByPlaceholderText('Email input');
		expect(input).toHaveAttribute('type', 'email');
	});

	it('supports password type', () => {
		render(<Input type="password" placeholder="Password input" />);
		const input = screen.getByPlaceholderText('Password input');
		expect(input).toHaveAttribute('type', 'password');
	});

	it('applies focus styles', () => {
		render(<Input placeholder="Focus test" />);
		const input = screen.getByPlaceholderText('Focus test');
		expect(input).toHaveClass('focus:border-brand-primary', 'focus:ring-[3px]', 'focus:ring-brand-primary');
	});

	it('handles controlled value', () => {
		const TestComponent = () => {
			const [value, setValue] = React.useState('initial value');
			return (
				<Input 
					value={value} 
					onChange={(e) => setValue(e.target.value)}
					placeholder="Controlled input"
				/>
			);
		};

		render(<TestComponent />);
		const input = screen.getByDisplayValue('initial value');
		expect(input).toBeInTheDocument();
		
		fireEvent.change(input, { target: { value: 'updated value' } });
		expect(screen.getByDisplayValue('updated value')).toBeInTheDocument();
	});

	it('supports required attribute', () => {
		render(<Input required placeholder="Required input" />);
		const input = screen.getByPlaceholderText('Required input');
		expect(input).toBeRequired();
	});

	it('supports maxLength attribute', () => {
		render(<Input maxLength={10} placeholder="Max length input" />);
		const input = screen.getByPlaceholderText('Max length input');
		expect(input).toHaveAttribute('maxLength', '10');
	});

	it('supports readOnly attribute', () => {
		render(<Input readOnly value="Read only value" placeholder="Read only input" />);
		const input = screen.getByDisplayValue('Read only value');
		expect(input).toHaveAttribute('readOnly');
	});

	it('renders without type attribute when no type specified', () => {
		render(<Input placeholder="Default type" />);
		const input = screen.getByPlaceholderText('Default type');
		expect(input).not.toHaveAttribute('type');
	});
});