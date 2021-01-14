/* eslint no-unused-expressions: 0 */

function conductTest(patientName) {
  this.expect.section('@navbar').to.be.visible;
  this.section.navbar.expect.element('@conductTestLink').to.be.visible;
  this.section.navbar.click('@conductTestLink');
  this.section.app.expect.element('@searchBar').to.be.visible;
  this.section.app.setValue('@searchBar', patientName);
  this.expect.section('@searchResults').to.be.visible;
  this.section.searchResults.expect.element('@beginTest').to.be.visible;
  this.section.searchResults.expect
    .element('@beginTest')
    .to.contain.text('Begin Test');
  this.section.searchResults.click('@beginTest');
  this.expect.section('@modal').to.be.visible;
  this.expect
    .section('@modal')
    .to.contain.text('Are you experiencing any of the following symptoms?');
  this.section.modal.expect.element('@noSymptoms').to.be.visible;
  this.section.modal.click('@noSymptoms');
  this.section.modal.expect.element('@firstTest').to.be.visible;
  this.section.modal.click('@firstTest');
  this.section.modal.expect.element('@pregnant').to.be.visible;
  this.section.modal.click('@pregnant');
  this.section.modal.expect.element('@continueButton').to.be.visible;
  this.section.modal.click('@continueButton');
  this.expect.section('@queueCard').to.be.visible;
  this.expect.section('@queueCard').to.contain.text(patientName);
  this.expect.section('@queueCard').to.contain.text('SARS-CoV-2 Results');
  this.section.queueCard.expect.element('@negativeResult').to.be.visible;
  this.section.queueCard.click('@negativeResult');
  this.section.queueCard.expect.element('@submitResultButton').to.be.visible;
  this.section.queueCard.click('@submitResultButton');
  this.expect
    .section('@app')
    .to.contain.text(`Result was saved and reported for ${patientName}`);
  this.expect.section('@cardContainer').to.not.contain.text(patientName);
  this.section.navbar.click('@resultsLink');
  this.section.app.expect.element('@resultsTable').to.be.visible;
  this.section.app.expect.element('@resultsTable').to.contain.text(patientName);
}

module.exports = {
  url: function () {
    return this.api.launchUrl + '/';
  },
  commands: [
    {
      conductTest,
    },
  ],
  sections: {
    app: {
      selector: '.App',
      elements: {
        searchBar: '#search-field-small',
        resultsTable: '.usa-table',
      },
    },
    navbar: {
      selector: '.usa-nav-container',
      elements: {
        conductTestLink: '#conduct-test-nav-link',
        resultsLink: '#results-nav-link',
      },
    },
    searchResults: {
      selector: '.results-dropdown',
      elements: {
        beginTest: 'button.usa-button--unstyled:first-of-type',
      },
    },
    modal: {
      selector: '.ReactModal__Content',
      elements: {
        noSymptoms: 'input[name="symptom_list"]:first-of-type+label',
        firstTest: 'input[name="prior_test_flag"]:first-of-type+label',
        pregnant: 'input[name="pregnancy"]:first-of-type+label',
        continueButton: '.sr-time-of-test-buttons button:last-of-type',
      },
    },
    cardContainer: {
      selector: '.prime-home .grid-container',
    },
    queueCard: {
      selector: 'div.prime-queue-item:last-of-type',
      elements: {
        negativeResult: '.prime-radios input[value="NEGATIVE"]+label',
        submitResultButton: '.prime-test-result-submit button',
      },
    },
  },
};
