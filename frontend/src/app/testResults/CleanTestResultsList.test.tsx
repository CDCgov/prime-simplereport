import qs from "querystring";

import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import CleanTestResultsList from "./CleanTestResultsList";

const mockStore = configureStore([]);
const store = mockStore({
  organization: {
    name: "Organization Name",
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
  },
  facilities: [
    { id: "1", name: "Facility 1" },
    { id: "2", name: "Facility 2" },
  ],
  facility: { id: "1", name: "Facility 1" },
});

const mockPush = jest.fn();
jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: mockPush,
  }),
}));

describe("CleanTestResultsList", () => {
  it("should redirect to page 1 of test results", async () => {
    await render(
      <MemoryRouter
        initialEntries={[{ pathname: "/results/", search: "?facility=1" }]}
      >
        <Provider store={store}>
          <CleanTestResultsList />
        </Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/results/1",
        search: qs.stringify({
          facility: 1,
        }),
      });
    });
  });
});
