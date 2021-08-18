import { MockedProvider } from "@apollo/client/testing";
import { render, RenderResult, screen } from "@testing-library/react";
import MockDate from "mockdate";
import ReactDOM from "react-dom";

import AoEModalForm, { LAST_TEST_QUERY } from "./AoEModalForm";

jest.mock("./AoEForm", () => () => <></>);
jest.mock("react-modal", () => (props: any) => <>{props.children}</>);

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

describe("AoEModalForm", () => {
  let component: RenderResult["container"];

  beforeAll(() => {
    ReactDOM.createPortal = jest.fn((element, node) => {
      return element;
    }) as any;
  });

  beforeEach(() => {
    MockDate.set("2021-02-06");
    component = render(
      <MockedProvider mocks={mocks} addTypename={false}>
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
            priorTestDate: "",
            priorTestResult: "",
            priorTestType: "",
            firstTest: false,
            pregnancy: "",
          }}
          saveCallback={jest.fn()}
        />
      </MockedProvider>
    ).container;
  });

  describe("on data loaded", () => {
    beforeEach(async () => {
      // load data
      await screen.findByText("Test questionnaire");
    });

    it("renders", async () => {
      expect(component).toMatchSnapshot();
    });
  });
});
