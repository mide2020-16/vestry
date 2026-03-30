// components/receipt/VestryReceiptPDF.tsx  ← main entry point
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles } from "@/constants/receipt.styles";
import { Registration } from "@/types/receipt.types";
import { TearLine } from "./TearLine";
import { ReceiptHeader } from "./ReceiptHeader";
import { ReceiptBody } from "./ReceiptBody";
import { ReceiptFooter } from "./ReceiptFooter";

interface VestryReceiptPDFProps {
  registration: Registration;
  qrDataUrl: string;
}

export function VestryReceiptPDF({
  registration,
  qrDataUrl,
}: VestryReceiptPDFProps) {
  const eventDate = new Date(registration.createdAt).toLocaleDateString(
    "en-NG",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const attendee =
    registration.ticketType === "couple" && registration.partnerName
      ? `${registration.name} & ${registration.partnerName}`
      : registration.name;

  return (
    <Document
      title={`Singles' Week Ticket — ${registration.paystackReference}`}
      author="MFMCFFUNAAB"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.accentBar} />

        <ReceiptHeader paystackReference={registration.paystackReference} />
        <TearLine />
        <ReceiptBody
          registration={registration}
          attendee={attendee}
          eventDate={eventDate}
        />
        <TearLine />
        <ReceiptFooter
          totalAmount={registration.totalAmount}
          qrDataUrl={qrDataUrl}
        />

        <View style={styles.strip}>
          <Text style={styles.stripText}>
            Present this ticket at the entrance
          </Text>
          <Text style={styles.stripAccent}>VESTRY | MFMCFFUNAAB</Text>
        </View>

        <View style={styles.accentBar} />
      </Page>
    </Document>
  );
}
