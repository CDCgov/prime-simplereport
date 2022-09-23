import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsNav from "./SettingsNav";

describe("SettingsNav", () => {
  it("displays the nav order correctly and defaults to 'Manage Users'", () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsNav />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });
  describe("ManageFacility", () => {
    it("displays as active when viewing all facilities", () => {
      render(
        <MemoryRouter initialEntries={["/settings/facilities"]}>
          <SettingsNav />
        </MemoryRouter>
      );
      expect(screen.getByText("Manage facilities")).toHaveAttribute(
        "aria-current",
        "page"
      );
      expect(screen.getByText("Manage facilities")).toHaveClass("active", {
        exact: true,
      });
    });
    it("displays as active when viewing specific facility", () => {
      render(
        <MemoryRouter initialEntries={["/settings/facility/some-uuid"]}>
          <SettingsNav />
        </MemoryRouter>
      );
      expect(
        screen.getByText("Manage facilities").parentElement
      ).toHaveAttribute("aria-current", "page");
      expect(screen.getByText("Manage facilities")).toHaveClass("active", {
        exact: true,
      });
    });
    it("displays as active when adding new facility", () => {
      render(
        <MemoryRouter initialEntries={["/settings/add-facility/some-uuid"]}>
          <SettingsNav />
        </MemoryRouter>
      );
      expect(
        screen.getByText("Manage facilities").parentElement
      ).toHaveAttribute("aria-current", "page");
      expect(screen.getByText("Manage facilities")).toHaveClass("active", {
        exact: true,
      });
    });
  });
});
