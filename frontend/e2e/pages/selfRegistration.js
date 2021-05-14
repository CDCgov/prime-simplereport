/* eslint no-unused-expressions: 0 */
const faker = require("faker");
const dayjs = require("dayjs");

function acceptTos() {
  this.expect.section("@app").to.be.visible;
  this.expect.section("@app").to.contain.text("I agree");
  this.section.app.expect.element("@tosConsentButton").to.be.visible;
  this.section.app.click("@tosConsentButton");
  return this;
}

function enterInformation(dobFormat) {
  // Generate a random patient
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const fullName = `${lastName}, ${firstName}`;
  const dob = dayjs(faker.date.between("1920-01-01", "2002-12-31"));
  const dobForInput = dob.format(dobFormat);
  const dobForPatientLink = dob.format("MM/DD/YYYY");
  const phone = "(800) 232-4636";
  const address = "736 Jackson PI NW";
  const state = "DC";
  const zip = "20503";
  const studentId = faker.datatype.uuid();

  this.expect
    .section("@enterInformation")
    .to.contain.text("General information");
  this.section.enterInformation.setValue("@firstName", firstName);
  this.section.enterInformation.setValue("@dob", dobForInput);
  this.section.enterInformation.setValue("@phone", phone);
  this.section.enterInformation.click("@phoneType-0");
  this.section.enterInformation.setValue("@address", address);
  this.section.enterInformation.setValue("@state", state);
  this.section.enterInformation.setValue("@zip", zip);
  this.section.enterInformation.click("@studentRole");
  this.expect.section("@enterInformation").to.contain.text("Student ID");
  this.section.enterInformation.setValue("@lookupId", studentId);
  this.section.enterInformation.click("@resident");
  this.section.enterInformation.click("@healthcareWorker");
  this.section.enterInformation.click("@saveButton");
  this.expect
    .section("@enterInformation")
    .to.contain.text("Last name is required");
  this.section.enterInformation.setValue("@lastName", lastName);
  this.section.enterInformation.click("@saveButton");
  this.section.confirmAddressModal.click("@addressSelect");
  this.section.confirmAddressModal.click("@save");
  this.expect
    .section("@confirmationScreen")
    .to.contain.text("you're registered for a COVID-19 test");

  return { patientName: fullName, birthDate: dobForPatientLink };
}

module.exports = {
  url: function () {
    return this.api.launchUrl + "/register/dis-org";
  },
  commands: [{ acceptTos, enterInformation }],
  sections: {
    app: {
      selector: ".patient-app",
      elements: {
        tosConsentButton: "#tos-consent-button",
      },
    },
    enterInformation: {
      selector: "#registration-container",
      elements: {
        firstName: 'input[name="firstName"]',
        lastName: 'input[name="lastName"]',
        dob: 'input[name="birthDate"]',
        phone: 'input[name="number"]',
        "phoneType-0": 'input[name="phoneType-0"]+label',
        address: 'input[name="street"]',
        state: 'select[name="state"]',
        zip: 'input[name="zipCode"]',
        studentRole: 'select[name="role"] option[value=STUDENT]',
        lookupId: 'input[name="lookupId"]',
        resident: 'input[name="residentCongregateSetting"]+label',
        healthcareWorker: 'input[name="employedInHealthcare"]+label',
        saveButton: ".usa-button",
      },
    },
    confirmAddressModal: {
      selector: ".modal__container",
      elements: {
        save: "#save-confirmed-address",
        addressSelect: 'input[name="addressSelect"]+label',
      },
    },
    confirmationScreen: {
      selector: ".prime-formgroup",
    },
  },
};
