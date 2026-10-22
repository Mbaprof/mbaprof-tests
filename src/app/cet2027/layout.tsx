import { Playfair_Display } from "next/font/google";

// The campaign pages have their own look (their own header, footer and fonts),
// so they live outside the portal's (marketing) layout and carry no portal
// navigation, which keeps visitors focused on the form. Headlines use a serif
// that echoes the MBA Prof logo; body text uses the site's Inter.
const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export default function Cet2027Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${display.variable} w-full bg-white font-sans text-brand-ink antialiased`}
      style={{ scrollBehavior: "smooth" }}
    >
      {children}
    </div>
  );
}
