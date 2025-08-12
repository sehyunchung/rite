/**
 * Re-export native components from @rite/ui
 * This ensures TypeScript uses the correct native types
 */

// Export native components with proper types
export { Button, type ButtonProps } from '../../../packages/ui/src/components/button/button.native';
export { Input, type InputProps } from '../../../packages/ui/src/components/input/input.native';
export {
	Textarea,
	type TextareaProps,
} from '../../../packages/ui/src/components/textarea/textarea.native';

// Re-export other components that are the same across platforms
export {
	Typography,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
	EventCard,
	ActionCard,
	Label,
	Badge,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	LoadingIndicator,
	FullScreenLoading,
} from '@rite/ui';
