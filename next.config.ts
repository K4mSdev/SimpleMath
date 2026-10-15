import type { NextConfig } from "next";

const isExport = process.env.NEXT_EXPORT === "true";

const nextConfig: NextConfig = {
  /* config options here */
  output: isExport ? "export" : undefined,
  images: {
    unoptimized: isExport ? true : false,
  },
  // Pozwala otworzyć serwer deweloperski z iPhone'a w tej samej sieci Wi-Fi (np. http://192.168.1.2:3000).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

