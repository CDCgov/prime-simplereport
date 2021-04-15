const rootDir = process.cwd();
const backendDir = ` ${rootDir}/backend`;
const frontendDir = ` ${rootDir}/frontend`;

module.exports = {
  "backend/**/*.java": () => `${backendDir}/gradlew -p ${backendDir} spotlessApply`,
  "frontend/**/*.{js,ts,jsx,tsx}": (files) => ([
      `${frontendDir}/node_modules/.bin/prettier --config ${frontendDir}/package.json --write ${files.join(" ")}`,
      `${frontendDir}/node_modules/.bin/eslint --config ${frontendDir}/package.json --resolve-plugins-relative-to ${frontendDir} --fix ${files.join(" ")}`,
  ]),
  "frontend/**/*.scss": (files) => (`${frontendDir}/node_modules/.bin/stylelint --config ${frontendDir}/.stylelintrc.json --config-basedir ${frontendDir} --fix ${files.join(" ")}`)
};
