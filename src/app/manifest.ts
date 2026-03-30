import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vestry | MFMCF FUNAAB",
    short_name: "Vestry",
    description:
      "Register for the Vestry Event — select your merch, food, and drinks.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    categories: ["events", "lifestyle"],
    icons: [
      {
        src: "/logo/maskable_icon_x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/maskable_icon_x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo/maskable_icon_x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/maskable_icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  };
}
