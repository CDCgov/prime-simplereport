import renderer, { act } from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";
import MockDate from "mockdate";

import AoEModalForm from "./AoEModalForm";
import ReactDOM from "react-dom";

jest.mock("./AoEForm", () => () => <></>);
jest.mock("react-modal", () => (data: any) => (
  <div>
    {JSON.stringify(data.patient, null, 2)}
    dummy modal for state test
  </div>
));

const mocks = [];

describe("AoEModalForm", () => {
  let component: renderer.ReactTestRenderer;

  beforeAll(() => {
    ReactDOM.createPortal = jest.fn((element, node) => {
      return element;
    }) as any;
  });

  beforeEach(() => {
    MockDate.set("2021-02-06");
    component = renderer.create(
      <AoEModalForm
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
      />
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
});
