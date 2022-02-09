import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SignUpApp from "./SignUpApp";

describe("SignUpApp", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <SignUpApp />
      </MemoryRouter>
    );
  });
  it("renders", () => {
    expect(screen.getByText("Sign up for SimpleReport")).toBeInTheDocument();
  });
});
