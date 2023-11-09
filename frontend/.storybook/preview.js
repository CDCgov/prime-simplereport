import { initialize, mswLoader } from "msw-storybook-addon";
import { MockedProvider } from "@apollo/client/testing";
import "../src/scss/App.scss";

initialize();

const preview = {
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
  },
  // Provide the MSW addon loader globally
  loaders: [mswLoader],
};

export default preview;
