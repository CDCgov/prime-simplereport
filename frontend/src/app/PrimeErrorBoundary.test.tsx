import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PrimeErrorBoundary from "./PrimeErrorBoundary";
import ErrorPage from "./commonComponents/ErrorPage";

import { Component } from "react";

jest.mock("./AppInsights", () => {
    return {
        appInsights: {trackException: jest.fn()}
    };
  });

  interface State {}
  interface Props {}
  
  class ComponentOfDeath extends Component<Props, State> {
    public state: State = {}

    public componentDidMount() {
      throw new Error("a really terrible uncaught exception!");
    }
    public render() {
      return <h1>Component of doooom</h1>
    }
  }

describe("PrimeErrorBoundary", () => {
    beforeEach( () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
    }); 

    afterEach(() => {
        jest.spyOn(console, "error").mockRestore();
    })

  it("renders the error page on component error", () => {
      const { container } = render(
          <MemoryRouter>
              <PrimeErrorBoundary onError={(error: any) => 
                <ErrorPage></ErrorPage>}>
                    <ComponentOfDeath></ComponentOfDeath>
              </PrimeErrorBoundary>
          </MemoryRouter>
      )
      expect(container).toHaveTextContent("Something went wrong :(");
  });
});