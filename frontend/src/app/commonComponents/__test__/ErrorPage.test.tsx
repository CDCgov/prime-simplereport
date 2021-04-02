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
    expect(getByText("support@simplereport.gov")).toHaveAttribute('href', 'mailto:support@simplereport.gov');
    expect(container).toMatchSnapshot();
  });
});
