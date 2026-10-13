import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "aiAPP by aiNOW",
    short_name: "aiAPP",
    description:
      "Mobile app development from idea and prototype to tested build and handover.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfcfc",
    theme_color: "#18181b",
    icons: [
      { src: "/icon.svg?v=17-20260811", type: "image/svg+xml", sizes: "any" },
    ],
  };
}
