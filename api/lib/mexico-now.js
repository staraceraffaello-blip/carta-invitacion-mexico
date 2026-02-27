/**
 * Returns the current date-time in America/Mexico_City timezone
 * formatted as an ISO-like string suitable for Supabase timestamp columns.
 */
export default function mexicoNow() {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'America/Mexico_City',
  });
}
