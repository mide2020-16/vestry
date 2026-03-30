// components/receipt/ReceiptHeader.tsx
import { View, Text } from "@react-pdf/renderer";
import { styles } from "@/constants/receipt.styles";

interface ReceiptHeaderProps {
  paystackReference: string;
}

export function ReceiptHeader({ paystackReference }: ReceiptHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {/* Fixed: was "Singles&apos;s Week" (double possessive) */}
        <Text style={styles.headerTitle}>Singles&apos; Week</Text>
        <Text style={styles.headerSub}>Official Entry Ticket · 2026/2027</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerRefLabel}>REF</Text>
        <Text style={styles.headerRef}>{paystackReference}</Text>
      </View>
    </View>
  );
}
