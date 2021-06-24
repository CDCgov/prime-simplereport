import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AuthErrorPage from "../AuthErrorPage";

describe("ErrorPage", () => {
  it("displays the correct error message", () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <AuthErrorPage />
      </MemoryRouter>
    );
    expect(
      getByText("You don't have the appropriate permissions to view this page")
    ).toBeInTheDocument();
    expect(getByText("support@simplereport.gov")).toHaveAttribute(
      "href",
      "mailto:support@simplereport.gov"
    );
    expect(container).toMatchSnapshot();
  });
});
