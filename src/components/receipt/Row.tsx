// components/receipt/Row.tsx
import { View, Text } from '@react-pdf/renderer';
import { styles } from '@/constants/receipt.styles';

interface RowProps {
  label: string;
  value?: string;
  badge?: boolean;
}

export function Row({ label, value, badge }: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {badge ? (
        <View style={styles.badgeWrap}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{value}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.rowValue}>{value}</Text>
      )}
    </View>
  );
}