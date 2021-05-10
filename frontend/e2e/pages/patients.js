/* eslint no-unused-expressions: 0 */
const faker = require("faker");
const dayjs = require("dayjs");

function addPatient(dobFormat) {
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

  this.expect.section("@navbar").to.be.visible;
  this.section.navbar.expect.element("@patientLink").to.be.visible;
  this.section.navbar.click("@patientLink");
  this.expect.section("@patientList").to.be.visible;
  this.section.patientList.expect.element("@addPatient").to.be.visible;
  this.section.patientList.click("@addPatient");
  this.expect.section("@editPatient").to.be.visible;
  this.expect.section("@editPatient").to.contain.text("Add New Person");
  this.section.editPatient.setValue("@firstName", firstName);
  this.section.editPatient.setValue("@dob", dobForInput);
  this.section.editPatient.setValue("@phone", phone);
  this.section.editPatient.setValue("@address", address);
  this.section.editPatient.setValue("@state", state);
  this.section.editPatient.setValue("@zip", zip);
  this.section.editPatient.click("@studentRole");
  this.expect.section("@editPatient").to.contain.text("Student ID");
  this.section.editPatient.setValue("@lookupId", studentId);
  this.section.editPatient.click("@resident");
  this.section.editPatient.click("@healthcareWorker");
  this.section.editPatient.click("@saveButton");
  this.expect.section("@editPatient").to.contain.text("Last name is required");
  this.expect.section("@editPatient").to.contain.text("Facility is required");
  this.section.editPatient.setValue("@lastName", lastName);
  this.section.editPatient.setValue("@facility", "All facilities");
  this.section.editPatient.click("@saveButton");
  this.section.confirmAddressModal.click("@addressSelect");
  this.section.confirmAddressModal.click("@save");
  this.expect.section("@patientList").to.be.visible;
  this.expect.section("@patientList").to.contain.text(fullName);

  return { patientName: fullName, birthDate: dobForPatientLink };
}

module.exports = {
  url: function () {
    return this.api.launchUrl + "/";
  },
  commands: [
    {
      addPatient,
    },
  ],
  sections: {
    app: {
      selector: ".App",
    },
    navbar: {
      selector: ".usa-nav-container",
      elements: {
        patientLink: {
          selector: "#patient-nav-link",
        },
      },
    },
    patientList: {
      selector: ".prime-container",
      elements: {
        addPatient: "#add-patient-button",
      },
    },
    editPatient: {
      selector: ".prime-edit-patient",
      elements: {
        firstName: 'input[name="firstName"]',
        lastName: 'input[name="lastName"]',
        facility: 'select[name="facilityId"]',
        dob: 'input[name="birthDate"]',
        phone: 'input[name="telephone"]',
        address: 'input[name="street"]',
        state: 'select[name="state"]',
        zip: 'input[name="zipCode"]',
        studentRole: 'select[name="role"] option[value=STUDENT]',
        lookupId: 'input[name="lookupId"]',
        resident: 'input[name="residentCongregateSetting"]+label',
        healthcareWorker: 'input[name="employedInHealthcare"]+label',
        saveButton: ".prime-save-patient-changes",
      },
    },
    confirmAddressModal: {
      selector: ".modal__container",
      elements: {
        save: "#save-confirmed-address",
        addressSelect: 'input[name="addressSelect"]+label',
      },
    },
  },
};
