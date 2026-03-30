// constants/receipt.styles.ts
import { StyleSheet } from "@react-pdf/renderer";

export const gold = "#fbbf24";
export const dark = "#0a0a0a";
export const darkCard = "#171717";
export const darkBorder = "#262626";
export const muted = "#737373";
export const white = "#ffffff";
export const green = "#34d399";
export const greenBg = "#022c22";

export const styles = StyleSheet.create({
  page: {
    backgroundColor: dark,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontFamily: "Helvetica",
  },

  // ── Accent bar ────────────────────────────────────────
  accentBar: {
    height: 3,
    backgroundColor: gold,
  },

  // ── Header ────────────────────────────────────────────
  header: {
    backgroundColor: gold,
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flexDirection: "column", gap: 2 },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: dark,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  headerSub: {
    fontSize: 8,
    color: "#78350f",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 3,
  },
  headerRight: { alignItems: "flex-end" },
  headerRefLabel: {
    fontSize: 7,
    color: "#78350f",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headerRef: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: dark,
    marginTop: 3,
    maxWidth: 130,
  },

  // ── Tear line ─────────────────────────────────────────
  tearRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: dark,
  },
  tearCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: dark,
  },
  tearLine: {
    flex: 1,
    borderTopWidth: 1.5,
    borderTopColor: darkBorder,
    borderTopStyle: "dashed",
    marginHorizontal: 4,
  },

  // ── Body ──────────────────────────────────────────────
  body: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    backgroundColor: darkCard,
  },
  sectionLabel: {
    fontSize: 7,
    color: muted,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  rowLabel: { fontSize: 10, color: muted, flex: 1 },
  rowValue: {
    fontSize: 10,
    color: white,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    flex: 2,
  },

  // ── Badge ─────────────────────────────────────────────
  badgeWrap: { alignItems: "flex-end", flex: 2 },
  badge: {
    backgroundColor: gold,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: dark,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },

  // ── Footer ────────────────────────────────────────────
  footer: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    backgroundColor: darkCard,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  amountLabel: {
    fontSize: 8,
    color: muted,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  amount: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: white,
    letterSpacing: -1,
  },

  // ── QR box ────────────────────────────────────────────
  qrBox: {
    width: 60,
    height: 60,
    backgroundColor: white,
    borderRadius: 8,
    padding: 5,
  },

  // ── Confirmed pill ────────────────────────────────────
  confirmedRow: {
    paddingHorizontal: 32,
    paddingBottom: 24,
    backgroundColor: darkCard,
    flexDirection: "row",
    alignItems: "center",
  },
  confirmedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: greenBg,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: "#065f46",
  },
  confirmedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: green,
  },
  confirmedText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: green,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // ── Bottom strip ──────────────────────────────────────
  strip: {
    backgroundColor: "#111111",
    paddingHorizontal: 32,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stripText: { fontSize: 8, color: "#404040", letterSpacing: 1 },
  stripAccent: { fontSize: 8, color: "#525252", letterSpacing: 1 },
});
