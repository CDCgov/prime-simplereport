import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ActionsMenu } from "./ActionsMenu";

describe("action menu", () => {
  it("should not have id attribute", () => {
    render(
      <ActionsMenu items={[{ name: "Print action", action: () => {} }]} />
    );
    expect(screen.getByText("More actions").parentElement).not.toHaveAttribute(
      "id"
    );
  });
  it("should have the id on the menu and menu items", async () => {
    render(
      <ActionsMenu
        id={"1234"}
        items={[{ name: "Print action", action: () => {} }]}
      />
    );
    expect(screen.getByText("More actions").parentElement).toHaveAttribute(
      "id",
      "action_1234"
    );

    await act(
      async () => await userEvent.click(screen.getByText("More actions"))
    );
    expect(screen.getByText("Print action")).toHaveAttribute(
      "id",
      "print_1234"
    );
  });
});
