/* eslint no-unused-expressions: 0 */

function addPatient() {
  this.expect.section('@navbar').to.be.visible;
  this.section.navbar.expect.element('@patientLink').to.be.visible;
  this.section.navbar.click('@patientLink');
  this.expect.section('@patientList').to.be.visible;
  this.section.patientList.expect.element('@addPatient').to.be.visible;
  this.section.patientList.click('@addPatient');
  this.expect.section('@editPatient').to.be.visible;
  this.expect.section('@editPatient').to.contain.text('Create New Person');
  this.section.editPatient.setValue('@firstName', 'Marty');
  this.section.editPatient.setValue('@lastName', 'McFly');
  this.section.editPatient.setValue('@dob', '1950-01-01');
  this.section.editPatient.setValue('@phone', '5555555555');
  this.section.editPatient.setValue('@address', '123 Main St');
  this.section.editPatient.setValue('@state', 'CA');
  this.section.editPatient.setValue('@zip', '95837');
  this.section.editPatient.click('@resident');
  this.section.editPatient.click('@healthcareWorker');
  this.section.editPatient.click('@saveButton');
  this.expect.section('@patientList').to.be.visible;
  this.expect.section('@patientList').to.contain.text('Marty McFly');
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
        firstName: '#id-4-1',
        lastName: '#id-8-1',
        dob: '#id-14-1',
        phone: '#id-16-1',
        address: '#id-20-1',
        state: '#id-28-1',
        zip: '#id-30-1',
        resident: 'input[name="residentCongregateSetting"]+label',
        healthcareWorker: 'input[name="employedInHealthcare"]+label',
        saveButton: '.prime-save-patient-changes',
      },
    },
  },
};
