import { whatsappNumber } from "@/lib/admin-students";

// A small "WhatsApp" button that opens a chat with the given phone number.
// Renders nothing if the number does not look like a phone number.
export function WhatsAppButton({
  phone,
  name,
  large = false,
}: {
  phone: string | null;
  name: string;
  large?: boolean;
}) {
  const number = whatsappNumber(phone);
  if (!number) return null;
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      title={`Message ${name} on WhatsApp`}
      aria-label={`Message ${name} on WhatsApp`}
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/10 font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366] hover:text-white ${
        large ? "px-3.5 py-2 text-sm" : "px-2 py-1 text-xs"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={large ? "h-4 w-4" : "h-3.5 w-3.5"}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35ZM12.04 21.8h-.01a9.9 9.9 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88ZM20.52 3.45A11.8 11.8 0 0 0 12.04 0C5.5 0 .18 5.32.18 11.86c0 2.09.55 4.13 1.59 5.93L.06 24l6.3-1.65a11.85 11.85 0 0 0 5.67 1.44h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.15-3.48-8.38Z" />
      </svg>
      WhatsApp
    </a>
  );
}
