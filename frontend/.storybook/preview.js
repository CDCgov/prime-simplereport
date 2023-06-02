import { addDecorator } from "@storybook/react";

import { MockedProvider } from "@apollo/client/testing"; // Use for Apollo Version 3+
import { initializeWorker } from "msw-storybook-addon";
import "../src/styles/App.css";

initializeWorker();

export const parameters = {
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
    // any props you want to pass to MockedProvider on every story
  },
};
