import { Libre_Franklin, Montserrat, Roboto } from "next/font/google";

// The campaign pages have their own look (their own header, footer and fonts),
// so they live outside the portal's (marketing) layout and carry no portal
// navigation, which keeps visitors focused on the form.
//
// Fonts follow the MBA Prof brand manual: Franklin Gothic for headings (Libre
// Franklin is its closest web font), Roboto for body text and Montserrat for
// the tagline and small labels.
const heading = Libre_Franklin({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});
const body = Roboto({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
const label = Montserrat({
  variable: "--font-label",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Cet2027Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${heading.variable} ${body.variable} ${label.variable} w-full bg-white font-[family-name:var(--font-body)] text-[#333333] antialiased`}
      style={{ scrollBehavior: "smooth" }}
    >
      {children}
    </div>
  );
}
