import { render, RenderResult, screen } from "@testing-library/react";
import MockDate from "mockdate";
import userEvent from "@testing-library/user-event";

import AoEModalForm from "./AoEModalForm";


jest.mock("./AoEForm", () => () => <></>);
// jest.mock("react-modal", () => (props: any) => <>{props.children}</>);

describe("AoEModalForm", () => {
  // let component: RenderResult["container"];
  let component: RenderResult;

  // trying to make Modal component render instead of injecting?
  // unnecessary if react-modal is mocked
  // beforeAll(() => {
  //     ReactDOM.createPortal = jest.fn((element, _node) => {
  //         return element;
  //     }) as any;
  // });

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
        saveCallback={jest.fn()}
      />
      // ).container;
    );
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

describe("experiment", () => {
  it("closes when it should", async () => {
    let mockClose = jest.fn(() => {});
    MockDate.set("2021-02-06");
    render(
      <AoEModalForm
        onClose={mockClose}
        patient={{
          internalId: "123",
          gender: "male",
          firstName: "Steve",
          lastName: "Jobs",
        }}
        saveCallback={jest.fn()}
      />
    );

    await screen.findByText("Test questionnaire");
    // userEvent.click(screen.getByAltText("Close"));
    userEvent.keyboard("{Escape}");
    expect(mockClose).toHaveBeenCalled();
  });
});
