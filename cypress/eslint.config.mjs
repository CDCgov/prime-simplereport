import cypress from "eslint-plugin-cypress"

export default [
    {
        plugins: {
            cypress: cypress
        },
        languageOptions: {
            globals: {
                ...cypress.globals
            }
        },
        rules : {
            "cypress/require-data-selectors": "warn"

        }
    },
];
