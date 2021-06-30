import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import SignUpApp from "./SignUpApp";
import QuestionsFormContainer from "./IdentityVerification/QuestionsFormContainer";

jest.mock("./IdentityVerification/QuestionsFormContainer");

describe("SignUpApp", () => {
  beforeEach(() => {
    (QuestionsFormContainer as any).mockImplementation(() => (
      <div>questions form</div>
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
    expect(screen.getByText("questions form")).toBeInTheDocument();
  });
});
