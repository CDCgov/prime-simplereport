import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SupportAdmin from "./SupportAdmin";

describe("SupportAdmin", () => {
  const renderWithRouter = () =>
    render(
      <MemoryRouter>
        <SupportAdmin />
      </MemoryRouter>
    );

  it("loads menu categories", () => {
    const { container } = renderWithRouter();
    expect(container).toMatchSnapshot();
  });
});
