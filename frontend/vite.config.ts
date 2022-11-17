import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createHtmlPlugin } from "vite-plugin-html";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const contentSecurityPolicyTag = !env.DEV
    ? ""
    : `<meta
        http-equiv="Content-Security-Policy"
        content="
            ${env.VITE_CONTENT_SECURITY_POLICY_DEFAULT_SRC}
            ${env.VITE_CONTENT_SECURITY_POLICY_SCRIPT_SRC}
            style-src 'self' 'unsafe-inline';
            img-src 'self' https://touchpoints.app.cloud.gov https://hhs-prime.okta.com data:;
            connect-src 'self'  https://us-street.api.smartystreets.com https://us-zipcode.api.smartystreets.com www.google-analytics.com https://touchpoints.app.cloud.gov https://dc.services.visualstudio.com/v2/track https://*.applicationinsights.azure.com ${env.VITE_BACKEND_URL}/ ;
            frame-src 'self' https://www.youtube.com;
        ">`;

  return {
    base: env.VITE_BASE_URL, // only works for prod build... but in dev mode it stripes the domain piece and only leaves the path
    plugins: [
      svgr(),
      react(),
      createHtmlPlugin({
        minify: true,
        entry: "/src/index.tsx",
        inject: {
          data: {
            title: env.VITE_TITLE,
            icon: `${env.VITE_PUBLIC_URL}/${env.VITE_ICON}`,
            description: env.VITE_DESCRIPTION,
            contentSecurityPolicy: contentSecurityPolicyTag,
          },
        },
      }),
    ],
    server: {
      port: 3000,
      origin: "http://localhost:3000",
    },
  };
});
