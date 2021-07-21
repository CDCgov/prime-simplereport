import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import SignUpApp from "./SignUpApp";
import PersonalDetailsForm from "./IdentityVerification/PersonalDetailsForm";

jest.mock("./IdentityVerification/PersonalDetailsForm");

describe("SignUpApp", () => {
  beforeEach(() => {
    (PersonalDetailsForm as any).mockImplementation(() => (
      <div>personal details form</div>
    ));

    render(
      <MemoryRouter initialEntries={["/identity-verification"]}>
        <SignUpApp
          match={{ path: "" } as any}
          location={{} as any}
          history={{} as any}
        />
      </MemoryRouter>
    );
  });
  it("renders", () => {
    expect(screen.getByText("personal details form")).toBeInTheDocument();
  });
});
