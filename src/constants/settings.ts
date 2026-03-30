export const REGISTRATION_END_DATE = new Date('2026-04-01T00:00:00Z');

export function isRegistrationOpen() {
  return new Date() < REGISTRATION_END_DATE;
}