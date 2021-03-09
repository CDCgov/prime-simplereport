const rootDir = process.cwd();

module.exports = {
  "frontend/*.{js,ts,jsx,tsx}": (files) => {
    process.chdir(`${rootDir}/frontend`);
    return [
      `npx eslint --fix ${files.join(" ")}`,
      `npx prettier --write ${files.join(" ")}`,
    ];
  },
  "backend/*.java": () => {
    process.chdir(`${rootDir}/backend`);
    return "./gradlew spotlessApply";
  },
};
