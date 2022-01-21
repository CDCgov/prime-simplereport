import qs from "querystring";

import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
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

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

describe("CleanTestResultsList", () => {
  it("should redirect to page 1 of test results", async () => {
    await render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/results", search: "?facility=1" }]}
        >
          <Routes>
            <Route path="/results" element={<CleanTestResultsList />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: "/results/1",
        search: qs.stringify({
          facility: 1,
        }),
      });
    });
  });
});
