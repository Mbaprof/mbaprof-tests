// The campaign pages have their own look (their own header, footer and hero),
// so they live outside the portal's (marketing) layout and carry no portal
// navigation, which keeps visitors focused on the form. Fonts and colours come
// from the site-wide brand setup in the root layout and globals.css.
export default function Cet2027Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-white text-brand-ink antialiased" style={{ scrollBehavior: "smooth" }}>
      {children}
    </div>
  );
}
