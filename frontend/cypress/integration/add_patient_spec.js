const faker = require("faker");
const dayjs = require("dayjs");

const getDobFormat = () => {
  /* NOTE: DOB format is currently browser specific
       - Firefox does not support <input type='date' /> and takes the format accepted by the app
       - Chrome does support the date type and expects MM/DD/YYYY
  */
  return Cypress.browser.name === "chrome" ? "MM/DD/YYYY" : "YYYY-MM-DD";
};

// Generate a random patient
const firstName = faker.name.firstName();
const lastName = faker.name.lastName();
const fullName = `${lastName}, ${firstName}`;
const dob = dayjs(faker.date.between("1920-01-01", "2002-12-31"));
const dobForInput = dob.format(getDobFormat());
const dobForPatientLink = dob.format("MM/DD/YYYY");
const phone = "(800) 232-4636";
const address = "736 Jackson PI NW";
const state = "DC";
const zip = "20503";
const studentId = faker.datatype.uuid();

describe("Adding a patient", () => {
  it("successfully loads", () => {
    cy.visit("/");
    cy.get(".usa-nav-container");
    cy.get("#patient-nav-link").click();
    cy.get(".prime-container");
    cy.get("#add-patient-button").click();
    cy.get(".prime-edit-patient").contains("Add new person");
    cy.get('input[name="firstName"]').type(firstName);
    cy.get('input[name="birthDate"]').type(dobForInput);
    cy.get('input[name="number"]').type(phone);
    cy.get('input[value="MOBILE"]+label').click();
    cy.get('input[name="street"]').type(address);
    cy.get('select[name="state"]').select(state);
    cy.get('input[name="zipCode"]').type(zip);
    cy.get('select[name="role"]').select("STUDENT");
    cy.get(".prime-edit-patient").contains("Student ID");
    cy.get('input[name="lookupId"]').type(studentId);
    cy.get('input[name="residentCongregateSetting"][value="NO"]+label').click();
    cy.get('input[name="employedInHealthcare"][value="NO"]+label').click();
    cy.get(".prime-save-patient-changes").first().click();

    cy.get(".prime-edit-patient").contains("Last name is required");
    cy.get(".prime-edit-patient").contains("Testing facility is required");
    cy.get(
      '.modal__container input[name="addressSelect-person"]+label'
    ).click();
    cy.get(".modal__container #save-confirmed-address").click();
    cy.get(".prime-container").contains(fullName);
  });
});
