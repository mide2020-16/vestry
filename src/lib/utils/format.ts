/**
 * Utility functions for formatting values.
 */

/**
 * Formats a number as Naira currency with 2 decimal places.
 * Example: 1500 -> ₦1,500.00
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace("NGN", "₦").trim();
}

/**
 * Alternative simple formatter that just adds the ₦ symbol and 2 decimals
 */
export function formatAmount(amount: number): string {
  return `₦${Number(amount).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
