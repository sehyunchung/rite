import { View, StyleSheet } from 'react-native';
import { riteColors } from '@/constants/Colors';

// Custom background for Android and Web to match RITE dark theme
export default function TabBarBackground() {
  return (
    <View style={styles.background} />
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: riteColors.neutral[700],
  },
});

export function useBottomTabOverflow() {
  return 0;
}
