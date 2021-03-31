import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ErrorPage from "../ErrorPage";

describe("ErrorPage", () => {
  it("displays the correct error message", () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>
    );
    expect(getByText("Something went wrong :(")).toBeInTheDocument();
    expect(
      getByText("Please try refreshing your browser.")
    ).toBeInTheDocument();
    expect(
      getByText(
        "If the problem continues, contact support@simplereport.gov for support."
      )
    ).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
