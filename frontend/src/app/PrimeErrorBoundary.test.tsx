import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Component } from "react";

import PrimeErrorBoundary from "./PrimeErrorBoundary";

class ComponentOfDeath extends Component<any, any> {
  public componentDidMount() {
    throw new Error("a really terrible uncaught exception!");
  }
  public render() {
    return <h1>Component of doooom</h1>;
  }
}

describe("PrimeErrorBoundary", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.spyOn(console, "error").mockRestore();
  });

  it("renders the error page on component error", () => {
    const { container } = render(
      <MemoryRouter>
        <PrimeErrorBoundary>
          <ComponentOfDeath></ComponentOfDeath>
        </PrimeErrorBoundary>
      </MemoryRouter>
    );
    expect(container).toHaveTextContent("Something went wrong :(");
  });
});
