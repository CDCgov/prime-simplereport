const {mergeConfig} = require('vite');

module.exports = {
  async viteFinal(config, {configType}) {
    // return the customized config
    return mergeConfig(config, {
      // customize the Vite config here
      resolve: {
        alias: {
          "@microsoft/applicationinsights-react-js": require.resolve("../src/stories/__mocks__/appInsights.ts"),
          "./TestTimer": require.resolve(
            "../src/stories/__mocks__/TestTimer.ts")
        },
      },
    });
  },
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    //"@storybook/addon-a11y"// revisit this add-ons
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-vite"
  }
}