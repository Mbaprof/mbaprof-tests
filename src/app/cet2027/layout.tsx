import { Plus_Jakarta_Sans } from "next/font/google";

// The campaign pages have their own look (their own header, footer and fonts),
// so they live outside the portal's (marketing) layout and carry no portal
// navigation, which keeps visitors focused on the form.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export default function Cet2027Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${jakarta.variable} w-full bg-white font-sans text-[#0F172A] antialiased`}
      style={{ scrollBehavior: "smooth" }}
    >
      {children}
    </div>
  );
}
