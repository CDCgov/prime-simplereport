import { generatePatient, loginHooks, testNumber } from "../support/e2e";
import {
    cleanUpPreviousRunSetupData,
    cleanUpRunOktaOrgs,
    setupRunData,
} from "../utils/setup-utils";

const patients = [generatePatient(), generatePatient()];
const specRunName = "spec02a";
const currentSpecRunVersionName = `${testNumber()}-cypress-${specRunName}`;

const patientToCsv = (patient) => {
    return `${patient.lastName},${patient.firstName},,,unknown,5/11/1933,unknown,unknown,123 Main Street,,Washington,,DC,20008,USA,565-666-7777,MOBILE,No,No,VISITOR,foo@example.com`;
};

describe("Bulk upload patients", () => {
    before("setup data", () => {
        loginHooks();

        cy.task("getSpecRunVersionName", specRunName)
            .then((prevSpecRunVersionName) => {
                if (prevSpecRunVersionName) {
                    cleanUpPreviousRunSetupData(prevSpecRunVersionName);
                    // putting this here as well as in the after hook to guarantee
                    // the cleanup function runs even if the test gets interrupted
                    cleanUpRunOktaOrgs(prevSpecRunVersionName);
                }
            })
            .then(() => {
                let data = {
                    specRunName: specRunName,
                    versionName: currentSpecRunVersionName,
                };
                cy.task("setSpecRunVersionName", data);
                setupRunData(currentSpecRunVersionName);
            });
    });

    after(() => {
        cleanUpRunOktaOrgs(currentSpecRunVersionName);
    });

    beforeEach(() => {
        loginHooks();
    });

    it("navigates to the result bulk upload page", () => {
        cy.visit("/");
        cy.get(".usa-nav-container");
        cy.get("#desktop-results-nav-link").click();
        cy.get(".prime-secondary-nav");
        cy.contains("Upload spreadsheet").click();
        cy.get("#upload_add-patient").click();
        cy.get(".prime-edit-patient").contains("Set up your spreadsheet");

    });


});
