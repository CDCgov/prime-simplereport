import { render, RenderResult, screen } from "@testing-library/react";
import MockDate from "mockdate";
import userEvent from "@testing-library/user-event";

import AoEModalForm from "./AoEModalForm";

jest.mock("./AoEForm", () => () => <></>);

describe("AoEModalForm", () => {
  let component: RenderResult;
  let mockOnClose = jest.fn();

  beforeEach(() => {
    MockDate.set("2021-02-06");
    component = render(
      <AoEModalForm
        isOpen={true}
        onClose={mockOnClose}
        patient={{
          internalId: "123",
          gender: "male",
          firstName: "Steve",
          lastName: "Jobs",
        }}
        saveCallback={jest.fn()}
      />
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

    it("closes on esc key", async () => {
      expect(mockOnClose).not.toHaveBeenCalled();
      await userEvent.keyboard("{Escape}");
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
