/* eslint no-unused-expressions: 0 */
const faker = require('faker');
const dayjs = require('dayjs');

function addPatient() {
  // Generate a random patient
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const fullName = `${firstName} ${lastName}`;
  const dob = dayjs(faker.date.past(100)).format('YYYY-MM-DD');
  const phone = faker.phone.phoneNumber();
  const address = faker.address.streetAddress();
  const state = faker.address.stateAbbr();
  const zip = faker.address.zipCodeByState(state);

  this.expect.section('@navbar').to.be.visible;
  this.section.navbar.expect.element('@patientLink').to.be.visible;
  this.section.navbar.click('@patientLink');
  this.expect.section('@patientList').to.be.visible;
  this.section.patientList.expect.element('@addPatient').to.be.visible;
  this.section.patientList.click('@addPatient');
  this.expect.section('@editPatient').to.be.visible;
  this.expect.section('@editPatient').to.contain.text('Add New Person');
  this.section.editPatient.setValue('@firstName', firstName);
  this.section.editPatient.setValue('@lastName', lastName);
  this.section.editPatient.setValue('@facility', '~~ALL-FACILITIES~~');
  this.section.editPatient.setValue('@dob', dob);
  this.section.editPatient.setValue('@phone', phone);
  this.section.editPatient.setValue('@address', address);
  this.section.editPatient.setValue('@state', state);
  this.section.editPatient.setValue('@zip', zip);
  this.section.editPatient.click('@resident');
  this.section.editPatient.click('@healthcareWorker');
  this.section.editPatient.click('@saveButton');
  this.expect.section('@patientList').to.be.visible;
  this.expect.section('@patientList').to.contain.text(fullName);

  return fullName;
}

module.exports = {
  url: function () {
    return this.api.launchUrl + '/';
  },
  commands: [
    {
      addPatient,
    },
  ],
  sections: {
    app: {
      selector: '.App',
    },
    navbar: {
      selector: '.usa-nav-container',
      elements: {
        patientLink: {
          selector: '#patient-nav-link',
        },
      },
    },
    patientList: {
      selector: '.prime-container',
      elements: {
        addPatient: '#add-patient-button',
      },
    },
    editPatient: {
      selector: '.prime-edit-patient',
      elements: {
        firstName: 'input[name="firstName"]',
        lastName: 'input[name="lastName"]',
        facility: 'select[name="currentFacilityId"]',
        dob: 'input[name="birthDate"]',
        phone: 'input[name="telephone"]',
        address: 'input[name="street"]',
        state: 'select[name="state"]',
        zip: 'input[name="zipCode"]',
        resident: 'input[name="residentCongregateSetting"]+label',
        healthcareWorker: 'input[name="employedInHealthcare"]+label',
        saveButton: '.prime-save-patient-changes',
      },
    },
  },
};
