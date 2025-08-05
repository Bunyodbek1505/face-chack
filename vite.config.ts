import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
});

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import fs from "fs";
// import path from "path";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     https: {
//       key: fs.readFileSync(path.resolve(__dirname, "ssl/localhost-key.pem")),
//       cert: fs.readFileSync(path.resolve(__dirname, "ssl/localhost-cert.pem")),
//     },
//     host: true,
//     port: 5173,
//   },
// });
