"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability is a progressive enhancement - failing silently
        // here should never block the app from working.
      });
    }
  }, []);

  return null;
}
