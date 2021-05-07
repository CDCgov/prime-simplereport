import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";

import AoEModalForm, { LAST_TEST_QUERY } from "./AoEModalForm";

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
          saveButtonText="save"
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
    const verbally = await screen.findByLabelText("verbally", {
      exact: false,
    });
    expect(verbally).toBeChecked();
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
});
