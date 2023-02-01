import { render, RenderResult, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UnsupportedStateModal } from "./UnsupportedStateModal";

describe("UnsupportedStateModal", () => {
  let mockOnClose = jest.fn();
  let component: RenderResult;

  beforeEach(() => {
    component = render(
      <UnsupportedStateModal
        showModal={true}
        onClose={mockOnClose}
        state={"MI"}
      />
    );
  });
  it("renders", () => {
    expect(component).toMatchSnapshot();
  });

  it("closes on continue", () => {
    const continueButton = expect(continueButton).toBeDisabled();

    screen.getByLabelText("acknowledged").click();
    expect(continueButton).toBeEnabled();
    continueButton.click();

    expect(mockOnClose).toBeCalledWith(false);
  });

  it("closes on esc key", async () => {
    expect(mockOnClose).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    expect(mockOnClose).toHaveBeenCalledWith(true);
  });
});
