import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Saral AI", short_name: "Saral AI", description: "WhatsApp AI appointment assistant for clinics and hospitals",
    start_url: "/", display: "browser", background_color: "#f7fafc", theme_color: "#0a7f5a",
    icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }],
  };
}
