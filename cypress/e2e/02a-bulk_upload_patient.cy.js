import { generatePatient, loginHooks, testNumber } from "../support/e2e";
import { setupOrgFacility } from "../utils/setup-utils";

const patients = [generatePatient(), generatePatient()];
const specRunName = "spec02a";

const patientToCsv = (patient) => {
  return `${patient.lastName},${patient.firstName},,,unknown,5/11/1933,unknown,unknown,123 Main Street,,Washington,,DC,20008,USA,565-666-7777,MOBILE,No,No,VISITOR,foo@example.com`;
};

describe("Bulk upload patients", () => {
  loginHooks();

  before("setup data", () => {
    let currentSpecRunVersionName = `${testNumber()}-cypress-${specRunName}`;
    setupOrgFacility(currentSpecRunVersionName);
  });

  it("navigates to the bulk upload page", () => {
    cy.visit("/");
    cy.get(".usa-nav-container");
    cy.get("#desktop-patient-nav-link").click();
    cy.get(".prime-container");
    cy.get("#add-patient").click();
    cy.get("#upload_add-patient").click();
    cy.get(".prime-edit-patient").contains("Set up your spreadsheet");
    cy.injectSRAxe();
    cy.checkAccessibility(); // Bulk upload patient form
  });
  it("uploads csv file of patients", () => {
    const csvFileContent =
      "last_name,first_name,middle_name,suffix,race,date_of_birth,biological_sex,ethnicity,street,street2,city,county,state,zip_code,country,phone_number,phone_number_type,employed_in_healthcare,resident_congregate_setting,role,email\n" +
      `${patientToCsv(patients[0])}\n` +
      `${patientToCsv(patients[1])}\n`;
    cy.get(".usa-radio__label").first().click(); // select one facility
    cy.get("input[type=file]").selectFile(
      {
        contents: Cypress.Buffer.from(csvFileContent),
        fileName: "contentData.csv",
        mimeType: "text/csv",
      },
      {
        action: "drag-drop",
      },
    );
    cy.get(".usa-button").contains("Upload CSV file").click();
    cy.get(".prime-edit-patient").contains("Success: Data confirmed");
  });
  it("patients should appear in the patients list", () => {
    cy.visit("/");
    cy.get(".usa-nav-container");
    cy.get("#desktop-patient-nav-link").click();
    cy.get(".usa-card__header").contains("Patients");
    cy.get(".usa-card__header").contains("Showing");
    cy.get("#search-field-small").type(patients[0].lastName);
    cy.get(".prime-container").contains(patients[0].fullName);
    cy.get("#search-field-small").clear();
    cy.get("#search-field-small").type(patients[1].lastName);
    cy.get(".prime-container").contains(patients[1].fullName);
  });
});
