/**
 * Pure functions for checkout and registration calculations.
 * These functions can be used safely on both the client (browser) and server.
 * Do NOT add database models or Mongoose-related imports to this file.
 */

/**
 * Calculates the Paystack processing fee.
 */
export function calculatePaystackFee(baseAmount: number): number {
  if (baseAmount <= 0) return 0;
  let fee = 0;
  if (baseAmount < 2500) {
    fee = (baseAmount * 0.015) / (1 - 0.015);
  } else {
    fee = ((baseAmount + 100) * 0.015) / (1 - 0.015) + 100;
  }
  // Cap at 2000
  return Math.min(fee, 2000);
}

/**
 * Validates an email address.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates ticket type.
 */
export function isValidTicketType(type: string | null | undefined): type is "single" | "couple" {
  return type === "single" || type === "couple";
}
