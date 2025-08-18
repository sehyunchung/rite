import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card.web';

describe('Card Components', () => {
	describe('Card', () => {
		it('renders correctly with default props', () => {
			render(
				<Card data-testid="card">
					<CardContent>Card content</CardContent>
				</Card>
			);
			const card = screen.getByTestId('card');
			expect(card).toBeInTheDocument();
			expect(card).toHaveClass('rounded-lg', 'bg-card', 'text-card-foreground', 'border', 'border-border', 'shadow-sm');
		});

		it('applies custom className', () => {
			render(
				<Card className="custom-card" data-testid="card">
					<CardContent>Card content</CardContent>
				</Card>
			);
			const card = screen.getByTestId('card');
			expect(card).toHaveClass('custom-card');
		});

		it('forwards ref correctly', () => {
			const ref = React.createRef<HTMLDivElement>();
			render(
				<Card ref={ref}>
					<CardContent>Card content</CardContent>
				</Card>
			);
			expect(ref.current).toBeInstanceOf(HTMLDivElement);
		});
	});

	describe('CardHeader', () => {
		it('renders correctly', () => {
			render(
				<Card>
					<CardHeader data-testid="card-header">
						<CardTitle>Title</CardTitle>
					</CardHeader>
				</Card>
			);
			const header = screen.getByTestId('card-header');
			expect(header).toBeInTheDocument();
			expect(header).toHaveClass('flex', 'flex-col', 'gap-2', 'p-6');
		});
	});

	describe('CardTitle', () => {
		it('renders correctly as div element', () => {
			render(
				<Card>
					<CardHeader>
						<CardTitle>Card Title</CardTitle>
					</CardHeader>
				</Card>
			);
			const title = screen.getByText('Card Title');
			expect(title).toBeInTheDocument();
			expect(title).toHaveClass('text-2xl', 'font-bold', 'leading-tight', 'text-text-primary');
		});

		it('applies custom className', () => {
			render(
				<Card>
					<CardHeader>
						<CardTitle className="custom-title">Card Title</CardTitle>
					</CardHeader>
				</Card>
			);
			const title = screen.getByText('Card Title');
			expect(title).toHaveClass('custom-title');
		});
	});

	describe('CardDescription', () => {
		it('renders correctly', () => {
			render(
				<Card>
					<CardHeader>
						<CardDescription>Card description text</CardDescription>
					</CardHeader>
				</Card>
			);
			const description = screen.getByText('Card description text');
			expect(description).toBeInTheDocument();
			expect(description).toHaveClass('text-sm', 'text-text-secondary');
		});
	});

	describe('CardContent', () => {
		it('renders correctly', () => {
			render(
				<Card>
					<CardContent data-testid="card-content">
						Content goes here
					</CardContent>
				</Card>
			);
			const content = screen.getByTestId('card-content');
			expect(content).toBeInTheDocument();
			expect(content).toHaveClass('p-6', 'pt-0');
			expect(content).toHaveTextContent('Content goes here');
		});
	});

	describe('CardFooter', () => {
		it('renders correctly', () => {
			render(
				<Card>
					<CardFooter data-testid="card-footer">
						Footer content
					</CardFooter>
				</Card>
			);
			const footer = screen.getByTestId('card-footer');
			expect(footer).toBeInTheDocument();
			expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
			expect(footer).toHaveTextContent('Footer content');
		});
	});

	describe('Complete Card Structure', () => {
		it('renders a complete card with all components', () => {
			render(
				<Card data-testid="complete-card">
					<CardHeader>
						<CardTitle>Complete Card</CardTitle>
						<CardDescription>This is a complete card example</CardDescription>
					</CardHeader>
					<CardContent>
						<p>Main card content goes here</p>
					</CardContent>
					<CardFooter>
						<button>Action Button</button>
					</CardFooter>
				</Card>
			);

			const card = screen.getByTestId('complete-card');
			const title = screen.getByText('Complete Card');
			const description = screen.getByText('This is a complete card example');
			const content = screen.getByText('Main card content goes here');
			const button = screen.getByRole('button', { name: 'Action Button' });

			expect(card).toBeInTheDocument();
			expect(title).toBeInTheDocument();
			expect(description).toBeInTheDocument();
			expect(content).toBeInTheDocument();
			expect(button).toBeInTheDocument();
		});
	});
});