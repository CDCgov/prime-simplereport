import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

import TermsOfService from "./TermsOfService";

import "../../i18n";

const mockStore = configureStore([]);

describe("TermsOfService", () => {
  it("renders", () => {
    const store = mockStore({
      plid: "foo",
    });
    render(
      <Router history={createMemoryHistory()}>
        <Provider store={store}>
          <MockedProvider mocks={[]} addTypename={false}>
            <TermsOfService />
          </MockedProvider>
        </Provider>
      </Router>
    );

    expect(screen.getByText("Terms of service")).toBeInTheDocument();
  });
});
