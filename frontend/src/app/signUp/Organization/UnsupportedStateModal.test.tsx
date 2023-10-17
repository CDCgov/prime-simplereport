import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UnsupportedStateModal } from "./UnsupportedStateModal";

describe("UnsupportedStateModal", () => {
  let mockOnClose = jest.fn();

  const renderWithUser = () => ({
    user: userEvent.setup(),
    component: render(
      <UnsupportedStateModal
        showModal={true}
        onClose={mockOnClose}
        state={"MI"}
      />
    ),
  });

  it("renders", () => {
    const { component } = renderWithUser();
    expect(component).toMatchSnapshot();
  });

  it("closes on continue", async () => {
    const { user } = renderWithUser();
    const continueButton = screen.getByText("Continue sign up");
    expect(continueButton).toBeDisabled();

    await act(async () => screen.getByLabelText("acknowledged").click());
    expect(continueButton).toBeEnabled();
    await user.click(continueButton);

    expect(mockOnClose).toBeCalledWith(false);
  });

  it("closes on esc key", async () => {
    const { user } = renderWithUser();
    expect(mockOnClose).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(mockOnClose).toHaveBeenCalledWith(true);
  });
});
