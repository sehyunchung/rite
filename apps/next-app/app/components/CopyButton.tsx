'use client';

import { Button } from '@rite/ui';
import { useState } from 'react';
import { LinkIcon, CheckIcon } from 'lucide-react';

interface CopyButtonProps {
	text: string;
	className?: string;
	iconOnly?: boolean;
}

export function CopyButton({ text, className, iconOnly = false }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error('Failed to copy:', error);
		}
	};

	return (
		<Button variant="outline" size="sm" onClick={handleCopy} className={className}>
			{iconOnly ? (
				copied ? (
					<CheckIcon className="w-4 h-4" />
				) : (
					<LinkIcon className="w-4 h-4" />
				)
			) : copied ? (
				'Copied!'
			) : (
				'Copy'
			)}
		</Button>
	);
}
