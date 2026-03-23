// components/receipt/ReceiptBody.tsx
import { View, Text } from '@react-pdf/renderer';
import { styles } from '@/constants/receipt.styles';
import { Row } from './Row';
import { Registration } from '@/types/receipt.types';

interface ReceiptBodyProps {
  registration: Registration;
  attendee: string;
  eventDate: string;
}

export function ReceiptBody({ registration, attendee, eventDate }: ReceiptBodyProps) {
  return (
    <View style={styles.body}>
      <Text style={styles.sectionLabel}>Attendee details</Text>

      <Row
        label={registration.ticketType === 'couple' ? 'Attendees' : 'Attendee'}
        value={attendee}
      />
      <Row label="Email"        value={registration.email} />
      <Row label="Ticket type"  value={registration.ticketType} badge />

      {registration.meshSelection && (
        <Row label="mesh" value={registration.meshSelection.name} />
      )}

      {(registration.foodSelections?.length ?? 0) > 0 && (
        <Row
          label="Food"
          value={registration.foodSelections?.map((f) => f.name).join(', ')}
        />
      )}

      {registration.drinkSelection && (
        <Row label="Drink" value={registration.drinkSelection.name} />
      )}

      <Row label="Date registered" value={eventDate} />
    </View>
  );
}