import renderer, { act } from "react-test-renderer";
import MockDate from "mockdate";

import AoEModalForm from "./AoEModalForm";
import ReactDOM from "react-dom";

jest.mock("./AoEForm", () => () => <></>);
jest.mock("react-modal", () => (props: any) => <>{props.children}</>);

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
      <div id="test-modal-container">
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
      </div>
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
