module.exports = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-addon-apollo-client",
    "@storybook/preset-create-react-app",
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
  staticDirs: ["../public"],
};
