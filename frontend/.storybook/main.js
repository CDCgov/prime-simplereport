const path = require("path");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-styling",
    "@storybook/addon-interactions",
    "@storybook/preset-create-react-app",
    "@storybook/addon-mdx-gfm",
    "storybook-addon-apollo-client",
  ],
  webpackFinal: async (config) => {
    config.resolve.alias["@microsoft/applicationinsights-react-js"] =
      require.resolve("../src/stories/__mocks__/appInsights.ts");
    config.resolve.alias["./TestTimer"] = require.resolve(
      "../src/stories/__mocks__/TestTimer.ts"
    );
    config.module.rules.push({
      test: /\.scss$/,
      sideEffects: true,
      use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"], // not sure which of these are needed
      include: path.resolve(__dirname, "../node_modules"),
    });
    return config;
  },
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  docs: {
    autodocs: true,
  },
};
