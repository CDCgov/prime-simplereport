import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { MockedProvider } from "@apollo/client/testing";

import PrimeErrorBoundary from "../../PrimeErrorBoundary";
import { store } from "../../store";
import { WhoAmIQueryMock } from "../../ReportingApp.test";

import { Escalations } from "./Escalations";

describe("Escalations", () => {
  it("Renders the page", async () => {
    const { container } = render(
      <PrimeErrorBoundary>
        <Provider store={store}>
          <MockedProvider mocks={[WhoAmIQueryMock]} addTypename={false}>
            <MemoryRouter>
              <Escalations />
            </MemoryRouter>
          </MockedProvider>
        </Provider>
      </PrimeErrorBoundary>
    );
    expect(container).toMatchSnapshot();
  });
});
