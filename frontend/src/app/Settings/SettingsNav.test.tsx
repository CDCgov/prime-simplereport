import { render } from "@testing-library/react";
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
});
