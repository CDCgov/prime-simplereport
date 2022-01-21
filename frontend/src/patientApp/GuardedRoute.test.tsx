import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import GuardedRoute from "./GuardedRoute";
import TermsOfService from "./timeOfTest/TermsOfService";
import "../i18n";

const mockStore = configureStore([]);
const store = mockStore({
  plid: "foo",
});
const mockContainer = (auth: boolean) => (
  <Provider store={store}>
    <MemoryRouter initialEntries={["/terms-of-service"]}>
      <Routes>
        <Route
          element={<GuardedRoute auth={auth} element={<TermsOfService />} />}
          path="/terms-of-service"
        />
        <Route path="/" element={<p>This is some very specific text</p>} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

describe("GuardedRoute", () => {
  it("should not redirect to '/' if auth is true", () => {
    render(mockContainer(true));
    expect(screen.getByText("Terms of service")).toBeInTheDocument();
  });
  it("should redirect to '/' if auth is false", () => {
    render(mockContainer(false));
    expect(
      screen.getByText("This is some very specific text")
    ).toBeInTheDocument();
  });
});
