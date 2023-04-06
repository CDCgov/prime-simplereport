import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ResultsNav from "./ResultsNav";

describe("ResultsNav", () => {
  it("displays the nav order correctly and defaults to 'Test Results'", () => {
    const { container } = render(
      <MemoryRouter>
        <ResultsNav />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
