import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import SignUpApp from "./SignUpApp";

describe("SignUpApp", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <SignUpApp
          match={{ path: "" } as any}
          location={{} as any}
          history={{} as any}
        />
      </MemoryRouter>
    );
  });
  it("renders", () => {
    expect(screen.getByText("Sign up for SimpleReport")).toBeInTheDocument();
  });
});
