"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Meta (Facebook) Pixel. Renders nothing unless a pixel id is configured.
// The page-view event fires on both pages; the Lead conversion fires ONLY on
// the thank-you page (pass `leadRef`), once per registration, so ad conversions
// are not double counted when someone refreshes.
export function MetaPixel({
  pixelId,
  leadRef,
}: {
  pixelId: string | null;
  leadRef?: string;
}) {
  useEffect(() => {
    if (!pixelId || !leadRef) return;
    const key = `meta-lead-fired:${leadRef}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      // Storage blocked: fall through and fire once for this page view.
    }

    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (typeof window.fbq === "function") {
        clearInterval(timer);
        window.fbq("track", "Lead");
        try {
          sessionStorage.setItem(key, "1");
        } catch {
          // ignore
        }
      } else if (tries > 50) {
        clearInterval(timer); // the pixel never loaded (ad blocker): give up quietly
      }
    }, 200);
    return () => clearInterval(timer);
  }, [pixelId, leadRef]);

  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
