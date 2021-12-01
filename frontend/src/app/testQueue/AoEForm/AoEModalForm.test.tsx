import { render, RenderResult, screen } from "@testing-library/react";
import MockDate from "mockdate";
import ReactDOM from "react-dom";

import AoEModalForm from "./AoEModalForm";

jest.mock("./AoEForm", () => () => <></>);
jest.mock("react-modal", () => (props: any) => <>{props.children}</>);

describe("AoEModalForm", () => {
  let component: RenderResult["container"];

  beforeAll(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  beforeEach(() => {
    MockDate.set("2021-02-06");
    component = render(
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
          pregnancy: "",
        }}
        saveCallback={jest.fn()}
      />
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
