import { View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function EventsScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 20 }}>
      <ThemedText type="title">Events</ThemedText>
      <ThemedText style={{ marginTop: 20 }}>
        Event listing functionality will be implemented here.
      </ThemedText>
      <ThemedText style={{ marginTop: 10, opacity: 0.7 }}>
        This screen will match the functionality from the Next.js app's events listing.
      </ThemedText>
    </ThemedView>
  );
}