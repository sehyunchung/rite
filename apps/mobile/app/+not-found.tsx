import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { Typography } from '@rite/ui';

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: 'Oops!' }} />
			<View className="flex-1 items-center justify-center p-5 bg-neutral-800">
				<Typography variant="h2" className="text-white mb-4">
					This screen does not exist.
				</Typography>
				<Link href="/" className="mt-4 py-4">
					<Typography variant="body" color="primary">
						Go to home screen!
					</Typography>
				</Link>
			</View>
		</>
	);
}
