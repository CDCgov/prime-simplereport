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
  ],
  webpackFinal: async (config) => {
    config.resolve.alias["@microsoft/applicationinsights-react-js"] =
      require.resolve("../src/stories/__mocks__/appInsights.ts");
    config.resolve.alias["./TestTimer"] = require.resolve(
      "../src/stories/__mocks__/TestTimer.ts"
    );
    config.module.rules.push({
      test: /\.scss$/,
      sideEffects: true, //scss is considered a side effect of sass
      use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
      include: path.resolve(__dirname, "../node_modules"), // I didn't need this path set
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
