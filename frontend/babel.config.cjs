module.exports = {
  presets: [
    ["@babel/preset-env", {targets: {node: "current"}}],
//    "@svgr/babel-preset",
    ["@babel/preset-react",{ "runtime": "automatic"}],
    "@babel/preset-typescript"
  ],
  "plugins": ["babel-plugin-transform-vite-meta-env"]
};