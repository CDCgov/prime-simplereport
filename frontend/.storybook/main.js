const path = require("path");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app",
  ],
  // Overrides CRA webpack settings:
  // https://github.com/facebook/create-react-app/issues/9870#issuecomment-719666170
  webpackFinal: async (config) => {
    config.module.rules.forEach(
      (r) =>
        r.oneOf &&
        r.oneOf.forEach((u) => {
          u.use?.forEach((el, i) => {
            if (/\/css-loader/.test(el?.loader)) {
              el.options = {
                ...el.options,
                url: (url) => {
                  if (/\.(ttf|eot|woff|woff2|svg|png)$/.test(url)) {
                    return false;
                  }
                  return true;
                },
              };
            }
          });
        })
    );
    return config;
  },
};
