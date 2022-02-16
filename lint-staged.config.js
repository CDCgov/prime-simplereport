const frontendDir = "/app/frontend";

module.exports = {
  "backend/**/*.java": () => "docker-compose run backend ./gradlew spotlessApply",
  "frontend/**/*.{js,ts,jsx,tsx}": (files) => ([
      `docker-compose run frontend ./node_modules/.bin/prettier --config ${frontendDir}/package.json --write ${files.join(" ")}`,
      `docker-compose run frontend ./node_modules/.bin/eslint --config ${frontendDir}/package.json --resolve-plugins-relative-to ${frontendDir} --fix ${files.join(" ")}`,
  ]),
  "frontend/**/*.scss": (files) => (`docker-compose run frontend ./node_modules/.bin/stylelint --config ${frontendDir}/.stylelintrc.json --config-basedir ${frontendDir} --fix ${files.join(" ")}`)
};
