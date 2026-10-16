import { MessageCircle } from 'lucide-react';
import { whatsappHref } from '@/lib/contact';

/** Floating WhatsApp chat button. Renders nothing until NEXT_PUBLIC_WHATSAPP_NUMBER is set. */
export function WhatsAppButton({ message = 'Hi Mistrail, I’m planning a trip to the Northeast.' }: { message?: string }) {
  const href = whatsappHref(message);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Mistrail on WhatsApp (opens in a new tab)"
      className="no-print fixed bottom-5 right-5 z-30 flex h-14 items-center gap-2 rounded-full bg-forest px-5 font-extrabold text-white shadow-xl transition-transform hover:scale-105 motion-reduce:transition-none"
    >
      <MessageCircle size={22} aria-hidden="true" />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
