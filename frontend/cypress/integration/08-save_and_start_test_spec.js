import { generatePatient, loginHooks } from "../support";

loginHooks();
let patientName, lastName, phoneNumber;
before("retrieve the patient info", () => {
  cy.task("getPatientName").then((name) => {
    patientName = name;
    lastName = patientName.split(",")[0];
  });
  cy.task("getPatientPhone").then((phone) => {
    phoneNumber = phone;
  });
});

describe("edit patient and save and start test", () => {
  it("searches for the patient and opens edit patient form", () => {
    cy.visit("/");
    cy.get(".usa-nav-container");
    cy.get("#desktop-patient-nav-link").click();
    cy.get("#search-field-small").type(lastName);
    cy.get(".sr-patient-list").contains(lastName).click();
  });
  it("edits the patient and clicks save and start test", () => {
    cy.get('input[value="male"]+label').click();
    cy.get(".prime-save-patient-changes-start-test").click();
    cy.get(".ReactModal__Content").contains(
      "Are you experiencing any of the following symptoms?"
    );
  });
  it("verifies patient contact info is correctly populated in the AoE form", () => {
    // patient created in 02-add-patient_spec.js has phone number but no email defined
    cy.contains("Yes, text all mobile numbers on file").click();
    cy.contains("Results will be sent to these numbers:");
    cy.contains(phoneNumber);
    cy.get('input[name="testResultDeliveryEmail"][value="EMAIL"]').should(
      "be.disabled"
    );
    cy.contains(
      "(There are no email addresses listed in your patient profile.)"
    );
  });
  it("completes AoE form and verifies queue", () => {
    cy.contains("New loss of taste").click();
    cy.contains("button", "Continue").click();
    cy.get(".prime-home").contains(patientName);
    cy.url().should("include", "queue");
  });
});

describe("add patient and save and start test", () => {
  const patient = generatePatient();
  patient.email = "myemail@test.com";

  it("navigates to the add patient form", () => {
    cy.visit("/");
    cy.get(".usa-nav-container");
    cy.get("#desktop-patient-nav-link").click();
    cy.get("#add-patient-button").click();
    cy.get(".prime-edit-patient").contains("Add new person");
  });
  it("fills out form fields and clicks save and start test", () => {
    cy.get('input[name="firstName"]').type(patient.firstName);
    cy.get('input[name="lastName"]').type(patient.lastName);
    cy.get('select[name="facilityId"]').select("All facilities");
    cy.get('input[name="birthDate"]').type(patient.dobForInput);
    cy.get('input[name="number"]').type(patient.phone);
    cy.get('input[value="LANDLINE"]+label').click();
    cy.get('input[name="email-0"]').type(patient.email);
    cy.get('input[name="street"]').type(patient.address);
    cy.get('select[name="state"]').select(patient.state);
    cy.get('input[name="zipCode"]').type(patient.zip);
    cy.get('input[name="race"][value="other"]+label').click();
    cy.get('input[name="ethnicity"][value="refused"]+label').click();
    cy.get('input[value="male"]+label').click();
    cy.get(".prime-save-patient-changes-start-test").first().click();
    cy.get(
      '.modal__container input[name="addressSelect-person"][value="userAddress"]+label'
    ).click();
    cy.get(".modal__container #save-confirmed-address").click();
  });
  it("verifies patient contact info is correctly populated in the AoE form", () => {
    cy.get('input[name="testResultDeliverySms"][value="SMS"]').should(
      "be.disabled"
    );
    cy.contains(
      "(There are no mobile phone numbers listed in your patient profile.)"
    );
    cy.contains(
      "fieldset",
      "Would you like to receive a copy of your results via email?"
    ).within(() => {
      cy.get('input[name="testResultDeliveryEmail"][value="EMAIL"]').should(
        "not.be.disabled"
      );
      cy.contains("Yes").click();
      cy.contains("Results will be sent to these email addresses:");
      cy.contains(patient.email);
    });
  });
  it("completes AoE form and verifies queue", () => {
    cy.contains("New loss of taste").click();
    cy.contains("button", "Continue").click();
    cy.get(".prime-home").contains(patient.firstName);
    cy.url().should("include", "queue");
  });
});

describe("edit patient from test queue", () => {
  it("navigates to test queue and clicks on patient name", () => {
    cy.visit("/");
    cy.get(".usa-nav-container");
    cy.get("#desktop-conduct-test-nav-link").click();
    cy.get(".card-name").contains(patientName).click();
  });
  it("edits the patient and clicks save changes", () => {
    cy.get('input[value="female"]+label').click();
    cy.get(".prime-save-patient-changes").first().click();
    cy.get(".ReactModal__Content").should("not.exist");
  });
  it("verifies test queue page with test card highlighted", () => {
    cy.url().should("include", "queue");
    cy.get(".prime-queue-item__info").contains(patientName);
  });
});

describe("start test from people page for patient already in queue", () => {
  it("navigates to people page and selects Start test", () => {
    cy.visit("/");
    cy.get(".usa-nav-container");
    cy.get("#desktop-patient-nav-link").click();
    cy.get("#search-field-small").type(lastName);
    cy.contains("tr", patientName).find(".sr-actions-menu").click();
    cy.contains("Start test").click();
    cy.get(".ReactModal__Content").should("not.exist");
  });
  it("verifies test queue page with test card highlighted", () => {
    cy.url().should("include", "queue");
    cy.get(".prime-queue-item__info").contains(patientName);
  });
});
