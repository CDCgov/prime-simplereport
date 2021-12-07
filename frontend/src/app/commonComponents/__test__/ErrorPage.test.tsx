import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ErrorPage from "../ErrorPage";

describe("ErrorPage", () => {
  it("displays the correct error message", () => {
    render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Something went wrong :(")).toBeInTheDocument();
    expect(
      screen.getByText("Please try refreshing your browser.")
    ).toBeInTheDocument();
    expect(screen.getByText("support@simplereport.gov")).toHaveAttribute(
      "href",
      "mailto:support@simplereport.gov"
    );
  });
});
