import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ResultsNavWrapper from "./ResultsNavWrapper";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "static-uuid"),
}));
describe("ResultsNav", () => {
  it("displays the results sub nav when user has the permission", () => {
    const { container } = render(
      <MemoryRouter>
        <ResultsNavWrapper>
          <>Testing 123</>
        </ResultsNavWrapper>
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });

  it("doesnt display the results sub nav when user doesnt have the permission", () => {
    const { container } = render(
      <MemoryRouter>
        <ResultsNavWrapper>
          <>Testing 123</>
        </ResultsNavWrapper>
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });
});