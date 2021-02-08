import renderer, { act } from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";
import MockDate from "mockdate";

import AoEForm, { LAST_TEST_QUERY } from "./AoEForm";

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
            dateTested: "2021-02-05T22:01:55.386Z",
            result: "NEGATIVE",
          },
        },
      },
    },
  },
];

describe("AoEForm", () => {
  let component: renderer.ReactTestRenderer;

  beforeEach(() => {
    MockDate.set("2021-02-06");
    component = renderer.create(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AoEForm
          saveButtonText="save"
          onClose={jest.fn()}
          patient={{
            internalId: "123",
            gender: "male",
          }}
          loadState={{
            noSymptoms: false,
            symptoms: '{"426000000":"true","49727002":false}',
            symptomOnset: "",
            priorTestDate: "",
            priorTestResult: "",
            priorTestType: "",
            firstTest: false,
            pregnancy: "",
          }}
          saveCallback={jest.fn()}
          isModal={false}
          noValidation={true}
        />
      </MockedProvider>
    );
  });

  describe("on data loaded", () => {
    beforeEach(async () => {
      // load data
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    });
    it("renders", async () => {
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe("on loading", () => {
    it("is null", async () => {
      expect(component.toJSON()).toBeNull();
    });
  });
});
