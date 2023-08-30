const { resolve } = require("path");
module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/preset-create-react-app",
    {
      name: "@storybook/addon-storysource",
      options: {
        rule: {
          test: [/\.stories\.[j|t]sx?$/],
          include: [resolve(__dirname, "../src")],
        },
      },
    },
  ],
  webpackFinal: async (config) => {
    config.resolve.alias["@microsoft/applicationinsights-react-js"] =
      require.resolve("../src/stories/__mocks__/appInsights.ts");
    config.resolve.alias["./TestTimer"] = require.resolve(
      "../src/stories/__mocks__/TestTimer.ts"
    );
    return config;
  },
  framework: {
    name: "@storybook/react-webpack5",
    options: { fastRefresh: true },
  },
  typescript: {
    reactDocgen: "react-docgen",
  },
};
