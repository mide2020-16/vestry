/* eslint-disable jsx-a11y/alt-text */
import { View, Text, Image } from "@react-pdf/renderer";
import { styles } from "@/constants/receipt.styles";

interface ReceiptFooterProps {
  totalAmount: number;
  qrDataUrl: string;
}

export function ReceiptFooter({ totalAmount, qrDataUrl }: ReceiptFooterProps) {
  return (
    <>
      <View style={styles.footer}>
        <View>
          <Text style={styles.amountLabel}>Amount Paid</Text>
          <Text style={styles.amount}>₦{totalAmount.toLocaleString()}</Text>
        </View>

        {qrDataUrl && (
          <View style={styles.qrBox}>
            <Image src={qrDataUrl} style={{ width: 50, height: 50 }} />
          </View>
        )}
      </View>

      <View style={styles.confirmedRow}>
        <View style={styles.confirmedPill}>
          <View style={styles.confirmedDot} />
          <Text style={styles.confirmedText}>Payment Confirmed</Text>
        </View>
      </View>
    </>
  );
}
