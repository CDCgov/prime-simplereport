import { act, render, RenderResult, screen } from "@testing-library/react";
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

  it("closes on continue", async () => {
    const continueButton = screen.getByText("Continue sign up");
    expect(continueButton).toBeDisabled();

    await act(async () => screen.getByLabelText("acknowledged").click());
    expect(continueButton).toBeEnabled();
    await act(async () => continueButton.click());

    expect(mockOnClose).toBeCalledWith(false);
  });

  it("closes on esc key", async () => {
    expect(mockOnClose).not.toHaveBeenCalled();
    await act(async () => await userEvent.keyboard("{Escape}"));
    expect(mockOnClose).toHaveBeenCalledWith(true);
  });
});
