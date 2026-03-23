// components/receipt/TearLine.tsx
import { View } from '@react-pdf/renderer';
import { styles } from '@/constants/receipt.styles';

export function TearLine() {
  return (
    <View style={styles.tearRow}>
      <View style={[styles.tearCircle, { marginLeft: -10 }]} />
      <View style={styles.tearLine} />
      <View style={[styles.tearCircle, { marginRight: -10 }]} />
    </View>
  );
}