import renderer from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import React from "react";

import AoEModalForm, { LAST_TEST_QUERY } from "./AoEModalForm";
import AoEForm from "./AoEForm";

const mocks = [
  {
    request: {
      query: LAST_TEST_QUERY,
      variables: {
        patientId: "123",
      },
    },
    result: {
      data: {
        patient: {
          lastTest: {
            dateTested: null,
            result: null,
          },
        },
      },
    },
  },
];

describe("AoEForm", () => {
  it("displays unknown prior test date and result", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <AoEModalForm
          onClose={jest.fn()}
          patient={{
            internalId: "123",
            gender: "male",
            firstName: "Steve",
            lastName: "Jobs",
          }}
          loadState={{
            noSymptoms: false,
            symptoms: '{"426000000":"true","49727002":false}',
            symptomOnset: "",
            priorTestDate: null,
            priorTestResult: null,
            priorTestType: null,
            firstTest: false,
            pregnancy: false,
          }}
          saveCallback={jest.fn()}
        />
      </MockedProvider>
    );
    const recentTestDate = await screen.findByLabelText(
      "Date of most recent test"
    );
    expect(recentTestDate).toBeDisabled();
    const checkbox = await screen.findByLabelText("Unknown");
    expect(checkbox).toBeChecked();
    const result = await screen.findByLabelText("Result of", {
      exact: false,
    });
    expect(result).toHaveValue("UNKNOWN");
  });

  it("converts date of last test to ISO Format", () => {
    let component: renderer.ReactTestRenderer;

    component = renderer.create(
      <MockedProvider mocks={mocks}>
        <AoEForm
          saveButtonText="save"
          onClose={jest.fn()}
          patient={{
            internalId: "123",
            gender: "male",
            testResultDelivery: "SMS",
            birthDate: "1980-01-01",
            telephone: "2708675309",
          }}
          loadState={{
            noSymptoms: false,
            symptoms: '{"426000000":"true","49727002":false}',
            symptomOnset: "2021-06-20",
            priorTestDate: "2021-06-21",
            priorTestResult: "NEGATIVE",
            priorTestType: "fake-test-type",
            firstTest: false,
            pregnancy: "77386006",
          }}
          saveCallback={jest.fn()}
          isModal={false}
          noValidation={true}
          lastTest={{
            dateTested: "2021-06-21T14:48:00",
            result: "NEGATIVE",
          }}
        />
      </MockedProvider>
    );

    expect(component.root.props.children.props.lastTest.dateTested).toEqual(
      "2021-06-21"
    );
  });
});
