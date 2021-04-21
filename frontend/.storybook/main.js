module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app",
  ],
  webpackFinal: async (config) => {
    // Force SASS loader to look for USWDS files
    config.module.rules.forEach(
      (r) =>
        r.use &&
        r.use.forEach((u) => {
          if (/sass-loader/.test(u.loader)) {
            u.options = {
              sassOptions: {
                includePaths: ["./node_modules/uswds/dist/scss/"],
              },
            };
          }
        })
    );
    return config;
  },
};
