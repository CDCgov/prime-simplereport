import { initialize, mswLoader } from "msw-storybook-addon";
import { MockedProvider } from "@apollo/client/testing";
import "../src/scss/App.scss";
import { BACKEND_URL, handlers } from "../src/stories/storyMocks";
import LegacyApplication from "../src/app/LegacyApplicationWrapper";
import type { Preview } from "@storybook/react-webpack5";

initialize({
  serviceWorker: {
    url: "../mockServiceWorker.js",
  },
  onUnhandledRequest: ({ url, method }) => {
    const pathname = new URL(url).pathname;
    if (BACKEND_URL && pathname.startsWith(BACKEND_URL)) {
      console.error(`Unhandled ${method} request to ${url}.

        This exception has been only logged in the console, however, it's strongly recommended to resolve this error as you don't want unmocked data in Storybook stories.

        If you wish to mock an error response, please refer to this guide: https://mswjs.io/docs/recipes/mocking-error-responses
      `);
    }
  },
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <LegacyApplication>
        <Story />
      </LegacyApplication>
    ),
  ],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    backgrounds: {
      default: "white",
      values: [
        {
          name: "white",
          value: "#fff",
        },
        {
          name: "light gray",
          value: "#f0f0f0",
        },
        {
          name: "dark",
          value: "#1b1b1b",
        },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    apolloClient: {
      MockedProvider,
    },
    msw: {
      handlers: handlers,
    },
  },
  // Provide the MSW addon loader globally
  loaders: [mswLoader],
};

export default preview;
