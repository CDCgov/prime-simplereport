jest.mock('https');

process.env.REPORT_STREAM_URL = 'https://cdc.gov';
process.env.REPORT_STREAM_TOKEN = 'not a real API token';

describe('publisherFunc', () => {
  const publisherFunc = require('./index');
  const https = require('https');

  beforeEach(() => {
    // Silence console output for this test. It's noisy, but we want these logs in prod.
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  test('completes normally when all dispatches succeed', async () => {
    const response = {
      id: "b70a7fc9-804f-4af8-9cd3-b4d94af7f7eb",
      reportItemCount: 114,
      destinations: [ {
        organization: "Arizona PHD",
        organization_id: "az-phd",
        service: "elr-test",
        sending_at: "2021-04-24T09:15-04:00",
        itemCount: 11
      }, {
        organization: "Arizona PHD",
        organization_id: "az-phd",
        service: "elr-hl7-test",
        sending_at: "2021-04-24T09:15-04:00",
        itemCount: 11
      }, {
        organization: "Pima County, Arizona PHD",
        organization_id: "pima-az-phd",
        service: "elr",
        sending_at: "2021-04-24T09:15-04:00",
        itemCount: 12
      }, {
        organization: "Florida Department of Health",
        organization_id: "fl-phd",
        service: "elr",
        sending_at: "2021-04-23T13:15-04:00",
        itemCount: 67
      }, {
        organization: "North Dakota Department of Health",
        organization_id: "nd-doh",
        service: "elr",
        sending_at: "2021-04-23T13:15-04:00",
        itemCount: 5
      }, {
        organization: "Guam Department of Health",
        organization_id: "gu-doh",
        service: "elr",
        sending_at: "2021-04-23T13:15-04:00",
        itemCount: 4
      }, {
        organization: "New Mexico Department of Health",
        organization_id: "nm-doh",
        service: "elr-csv",
        sending_at: "2021-04-24T09:15-04:00",
        itemCount: 11
      }, {
        organization: "New Mexico Department of Health",
        organization_id: "nm-doh",
        service: "elr",
        sending_at: "2021-04-23T13:15-04:00",
        itemCount: 11
      }, {
        organization: "Ohio Department of Health",
        organization_id: "oh-doh",
        service: "elr",
        sending_at: "2021-04-23T13:15-04:00",
        itemCount: 15
      }, {
        organization: "Arizona PHD",
        organization_id: "az-phd",
        service: "elr-prod",
        sending_at: "2021-04-24T09:15-04:00",
        itemCount: 1
      }, {
        organization: "Montana Department of Health",
        organization_id: "mt-doh",
        service: "elr",
        sending_at: "2021-04-24T09:15-04:00",
        itemCount: 1
      }, {
        organization: "Montana Department of Health",
        organization_id: "mt-doh",
        service: "elr-csv",
        sending_at: "2021-04-24T09:15-04:00",
        itemCount: 1
      } ],
      destinationCount: 12,
      warningCount: 0,
      errorCount: 0,
      errors: [ ],
      warnings: [ ]
    };
    https.__enqueueResponse({body: JSON.stringify(response)});

    await publisherFunc({}, JSON.stringify({foo: "bar"}));

    expect(console.log).toHaveBeenCalledTimes(response.destinations.length);
  });

  for (const invalid of ['"boo"', "null", "[]"]) {
    test(`throws when an invalid message ('${invalid}') is received`, async () => {
      expect.assertions(1);

      await expect(publisherFunc({}, '"boo"'))
        .rejects
        .toEqual(new Error("Queue messages must be formatted as JSON objects."));
    });
  }

  test('completes normally when warnings are generated', async () => {
    expect.assertions(2);

    const response = {
      id: "fd99fb4f-1fe9-4451-baf6-2b33a5c32682",
      reportItemCount: 70,
      destinations: [ {
        organization: "Arizona PHD",
        organization_id: "az-phd",
        service: "elr-test",
        sending_at: "2021-04-16T09:15-04:00",
        itemCount: 12
      }, {
        organization: "Arizona PHD",
        organization_id: "az-phd",
        service: "elr-hl7-test",
        sending_at: "2021-04-16T09:15-04:00",
        itemCount: 12
      }, {
        organization: "Pima County, Arizona PHD",
        organization_id: "pima-az-phd",
        service: "elr",
        sending_at: "2021-04-16T09:15-04:00",
        itemCount: 19
      }, {
        organization: "Florida Department of Health",
        organization_id: "fl-phd",
        service: "elr",
        sending_at: "2021-04-15T13:15-04:00",
        itemCount: 2
      }, {
        organization: "North Dakota Department of Health",
        organization_id: "nd-doh",
        service: "elr",
        sending_at: "2021-04-15T13:15-04:00",
        itemCount: 37
      }, {
        organization: "Ohio Department of Health",
        organization_id: "oh-doh",
        service: "elr",
        sending_at: "2021-04-15T13:15-04:00",
        itemCount: 12
      } ],
      destinationCount: 6,
      warningCount: 6,
      errorCount: 0,
      errors: [ ],
      warnings: [ {
        scope: "TRANSLATION",
        id: "TO:wi-dph.elr:covid-19",
        details: "JurisdictionalFilter or is not found"
      }, {
        scope: "TRANSLATION",
        id: "TO:tn-doh.elr:covid-19",
        details: "JurisdictionalFilter or is not found"
      }, {
        scope: "TRANSLATION",
        id: "TO:ms-doh.elr:covid-19",
        details: "JurisdictionalFilter or is not found"
      }, {
        scope: "TRANSLATION",
        id: "TO:nc-dph.elr:covid-19",
        details: "JurisdictionalFilter or is not found"
      }, {
        scope: "TRANSLATION",
        id: "TO:de-dph.elr:covid-19",
        details: "JurisdictionalFilter or is not found"
      }, {
        scope: "TRANSLATION",
        id: "TO:ca-dph.elr:covid-19",
        details: "JurisdictionalFilter or is not found"
      } ]
    };
    https.__enqueueResponse({body: JSON.stringify(response)});

    await publisherFunc({}, JSON.stringify({foo: "bar"}));

    expect(console.log).toHaveBeenCalledTimes(response.destinations.length);
    expect(console.warn).toHaveBeenCalledTimes(response.warnings.length);
  });

  test('throws when an error is returned by ReportStream', async () => {
    expect.assertions(2);

    const response = {
      id: "fbaaadd7-cb8a-454c-8e2f-6de0a87ada83",
      reportItemCount: 1,
      destinations: [],
      destinationCount: 0,
      warningCount: 0,
      errorCount: 1,
      errors: [ {
        scope: "ITEM",
        id: "31a471db-089a-4c65-82fe-5fe28735adbf",
        details: "Empty value for 'patient_state'"
      } ],
      warnings: [ ]
    };
    https.__enqueueResponse({body: JSON.stringify(response)});

    await expect(publisherFunc({}, JSON.stringify({})))
      .rejects
      .toEqual(new Error("Upload did not complete successfully"));

    expect(console.error).toHaveBeenCalledTimes(response.errors.length);
  });

  test('throws when an error is encountered sending a request to ReportStream', async () => {
    expect.assertions(1);
    const error = new Error("PANIC");
    https.__enqueueError(error);

    await expect(publisherFunc({}, JSON.stringify({fizz: "buzz"})))
      .rejects
      .toEqual(error);
  });
});


