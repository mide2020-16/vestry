/* eslint-disable @typescript-eslint/no-explicit-any */
import { View, Text } from "@react-pdf/renderer";
import { styles } from "@/constants/receipt.styles";
import { Row } from "./Row";
import { Registration } from "@/types/receipt.types";

interface ReceiptBodyProps {
  registration: Registration;
  attendee: string;
  eventDate: string;
}

export function ReceiptBody({
  registration,
  attendee,
  eventDate,
}: ReceiptBodyProps) {
  return (
    <View style={styles.body}>
      <Text style={styles.sectionLabel}>Attendee details</Text>

      <Row
        label={registration.ticketType === "couple" ? "Attendees" : "Attendee"}
        value={attendee}
      />
      <Row label="Email" value={registration.email} />
      <Row label="Ticket type" value={registration.ticketType} badge />

      {registration.meshSelection && (
        <View style={{ marginBottom: 8 }}>
          <Row label="Merch" value={registration.meshSelection.name} />

          {(registration.meshColor || registration.meshSize) && (
            <View
              style={{
                flexDirection: "row",
                marginTop: 2,
                justifyContent: "flex-end",
              }}
            >
              {registration.meshColor && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 10,
                  }}
                >
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 3.5, // Perfect circle for PDF
                      backgroundColor: registration.meshColor,
                      marginRight: 4,
                      border: "0.5pt solid #EEEEEE", // Hairline border for visibility
                    }}
                  />
                  <Text style={{ fontSize: 9, color: "#666666" }}>
                    Color Selected
                  </Text>
                </View>
              )}

              {registration.meshSize && (
                <View
                  style={{
                    paddingHorizontal: 4,
                    paddingVertical: 1,
                    backgroundColor: "#F5F5F5",
                    borderRadius: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      color: "#444444",
                      fontWeight: "bold",
                    }}
                  >
                    Size: {registration.meshSize}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Food Selections with Wrap Handling */}
      {(registration.foodSelections?.length ?? 0) > 0 && (
        <Row
          label="Food"
          value={registration.foodSelections
            ?.map((f: any) => f.name)
            .join(", ")}
        />
      )}

      {registration.drinkSelection && (
        <Row label="Drink" value={registration.drinkSelection.name} />
      )}

      <Row label="Date registered" value={eventDate} />
    </View>
  );
}
