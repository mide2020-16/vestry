import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  styles as receiptStyles,
  gold,
  darkBorder,
  muted,
  white,
} from "@/constants/receipt.styles";

const styles = StyleSheet.create({
  ...receiptStyles,
  page: {
    ...receiptStyles.page,
    padding: 0,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    paddingHorizontal: 32,
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#111111",
    borderBottomWidth: 1,
    borderBottomColor: darkBorder,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(38, 38, 38, 0.5)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  // Column Widths
  colName: { width: "20%" },
  colEmail: { width: "22%" },
  colMerch: { width: "18%" },
  colVariant: { width: "15%" },
  colInscription: { width: "15%" },
  colAmount: { width: "10%", textAlign: "right" },

  headerLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cellText: {
    fontSize: 9,
    color: white,
    fontFamily: "Helvetica",
  },
  cellTextBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: white,
  },
  cellSubText: {
    fontSize: 7,
    color: gold,
    marginTop: 2,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  inscriptionText: {
    fontSize: 8,
    color: gold,
    fontFamily: "Helvetica", // Note: Use Helvetica-Oblique if you register it
  },
});

interface Registration {
  _id: string;
  name: string;
  email: string;
  ticketType: string;
  meshSelection?: { name: string };
  meshSize?: string;
  meshColor?: string;
  meshInscriptions?: string;
  merch?: {
    name: string;
    quantity: number;
    color?: string;
    size?: string;
    inscriptions?: string;
  }[];
  totalAmount: number;
}

export const RegistrationPDF = ({
  registrations,
}: {
  registrations: Registration[];
}) => (
  <Document title="Vestry 2026 - Master Registry">
    <Page size="A4" orientation="landscape" style={styles.page}>
      {/* ── Brand Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Master Registry</Text>
          <Text style={styles.headerSub}>
            Official Guest & Inventory List — Vestry 2026
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerRefLabel}>Generated On</Text>
          <Text style={styles.headerRef}>
            {new Date().toLocaleDateString("en-GB")}
          </Text>
        </View>
      </View>

      <View style={styles.accentBar} />

      {/* ── Table Section ── */}
      <View style={styles.table}>
        {/* Table Header Row */}
        <View style={styles.tableHeader}>
          <View style={styles.colName}>
            <Text style={styles.headerLabel}>Name</Text>
          </View>
          <View style={styles.colEmail}>
            <Text style={styles.headerLabel}>Email</Text>
          </View>
          <View style={styles.colMerch}>
            <Text style={styles.headerLabel}>Merch</Text>
          </View>
          <View style={styles.colVariant}>
            <Text style={styles.headerLabel}>Size/Color</Text>
          </View>
          <View style={styles.colInscription}>
            <Text style={styles.headerLabel}>Inscription</Text>
          </View>
          <View style={styles.colAmount}>
            <Text style={styles.headerLabel}>Paid</Text>
          </View>
        </View>

        {/* Table Data Rows */}
        {registrations.map((reg, index) => (
          <View
            key={reg._id}
            style={[
              styles.tableRow,
              {
                backgroundColor:
                  index % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
              },
            ]}
          >
            <View style={styles.colName}>
              <Text style={styles.cellTextBold}>{reg.name}</Text>
              <Text style={styles.cellSubText}>{reg.ticketType}</Text>
            </View>

            <View style={styles.colEmail}>
              <Text style={[styles.cellText, { color: muted }]}>
                {reg.email}
              </Text>
            </View>

            <View style={styles.colMerch}>
              {reg.merch && reg.merch.length > 0 ? (
                reg.merch.map((m, i) => (
                  <Text key={i} style={styles.cellText}>
                    • {m.name} {m.quantity > 1 ? `(x${m.quantity})` : ""}
                  </Text>
                ))
              ) : (
                <Text style={styles.cellText}>
                  {reg.meshSelection?.name || "—"}
                </Text>
              )}
            </View>

            <View style={styles.colVariant}>
              {reg.merch && reg.merch.length > 0 ? (
                reg.merch.map((m, i) => (
                  <Text key={i} style={styles.cellText}>
                    {m.size || m.color
                      ? `${m.size || ""} ${m.color ? `/ ${m.color}` : ""}`
                      : "—"}
                  </Text>
                ))
              ) : (
                <Text style={styles.cellText}>
                  {reg.meshSize || "—"}{" "}
                  {reg.meshColor ? `/ ${reg.meshColor}` : ""}
                </Text>
              )}
            </View>

            <View style={styles.colInscription}>
              {reg.merch && reg.merch.length > 0 ? (
                reg.merch.map((m, i) => (
                  <Text key={i} style={styles.inscriptionText}>
                    {m.inscriptions ? `"${m.inscriptions}"` : "—"}
                  </Text>
                ))
              ) : (
                <Text style={styles.inscriptionText}>
                  {reg.meshInscriptions ? `"${reg.meshInscriptions}"` : "—"}
                </Text>
              )}
            </View>

            <View style={styles.colAmount}>
              <Text style={[styles.cellTextBold, { color: gold }]}>
                ₦{reg.totalAmount?.toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Footer Strip ── */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <View style={styles.strip}>
          <Text style={styles.stripText}>
            VESTRY REGISTRATION SYSTEM © 2026
          </Text>
          <Text style={styles.stripAccent}>CONFIDENTIAL ADMIN ACCESS ONLY</Text>
        </View>
      </View>
    </Page>
  </Document>
);
