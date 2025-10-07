import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createHtmlPlugin } from "vite-plugin-html";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const contentSecurityPolicyTag =
    env.NODE_ENV !== "development"
      ? `<meta
        http-equiv="Content-Security-Policy"
        content="
            ${env.VITE_CONTENT_SECURITY_POLICY_DEFAULT_SRC}
            ${env.VITE_CONTENT_SECURITY_POLICY_SCRIPT_SRC}
            style-src 'self' 'unsafe-inline';
            img-src 'self' https://touchpoints.app.cloud.gov https://hhs-prime.okta.com https://hhs-prime.oktapreview.com data:;
            connect-src 'self'  https://us-street.api.smartystreets.com https://us-zipcode.api.smartystreets.com www.google-analytics.com https://touchpoints.app.cloud.gov https://dc.services.visualstudio.com/v2/track https://*.applicationinsights.azure.com %REACT_APP_BACKEND_URL%/ ;
            frame-src 'self' https://www.youtube.com;
        ">`
      : "";

  return {
    base: env.VITE_BASE_URL, // only works for prod build... but in dev mode it stripes the domain piece and only leaves the path
    define: {
      PUBLIC_URL: JSON.stringify(new String(env.PUBLIC_URL)),
    },
    plugins: [
      svgr(),
      react(),
      createHtmlPlugin({
        minify: true,
        entry: "/src/index.tsx",
        inject: {
          data: {
            title: env.VITE_TITLE,
            icon: `${env.PUBLIC_URL}/${env.VITE_ICON}`,
            description: env.VITE_DESCRIPTION,
            contentSecurityPolicy: contentSecurityPolicyTag,
          },
        },
      }),
    ],
    server: {
      port: 3000,
    },
    preview: {
      port: 3000,
      proxy: {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      outDir: "build",
      manifest: true,
      rollupOptions: { output: { manualChunks: { lodash: ["lodash"] } } },
    },
  };
});
