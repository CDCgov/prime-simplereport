import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import TermsOfService from "./TermsOfService";

import "../../i18n";

const mockStore = configureStore([]);

describe("TermsOfService", () => {
  it("renders", () => {
    const store = mockStore({
      plid: "foo",
    });
    render(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <TermsOfService />
        </MockedProvider>
      </Provider>
    );

    expect(screen.getByText("Terms of service")).toBeInTheDocument();
  });
});
