import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router";
import createMockStore from "redux-mock-store";

import { SelfRegistration } from "./SelfRegistration";

const VALID_LINK = "foo-facility";

jest.mock("../PxpApiService", () => ({
  PxpApi: {
    getEntityName: (link: string) => {
      return new Promise((res, rej) => {
        if (link === VALID_LINK) {
          res("Foo Facility");
        } else {
          rej();
        }
      });
    },
  },
}));

const mockStore = createMockStore([]);
const store = mockStore({});

describe("SelfRegistration", () => {
  it("Renders the terms of service for a good link", async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={[`/register/${VALID_LINK}`]}>
            <Route
              exact
              path="/register/:registrationLink"
              component={SelfRegistration}
            />
          </MemoryRouter>
        </Provider>
      );
    });

    expect(screen.queryByText("Foo Facility")).toBeInTheDocument();
  });

  it("Renders a 404 page for a bad link", async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/register/some-bad-link"]}>
            <Route
              exact
              path="/register/:registrationLink"
              component={SelfRegistration}
            />
          </MemoryRouter>
        </Provider>
      );
    });

    expect(screen.queryByText("Page not found")).toBeInTheDocument();
  });
});
