import { render, screen, fireEvent } from "@testing-library/react";

import { Analytics } from "./Analytics";

describe("Analytics", () => {
  beforeEach(() => {
    render(<Analytics />);
  });

  it("renders", () => {
    expect(screen.getByText("COVID-19 testing data")).toBeInTheDocument();
  });
});
