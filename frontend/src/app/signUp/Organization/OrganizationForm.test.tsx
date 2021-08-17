import { render, screen } from "@testing-library/react";

import OrganizationForm from "./OrganizationForm";

describe("OrganizationForm", () => {
  beforeEach(() => {
    render(<OrganizationForm />);
  });
  it("initializes with the submit button disabled", () => {
    expect(screen.getByText("Submit")).toHaveAttribute("disabled");
  });
});
