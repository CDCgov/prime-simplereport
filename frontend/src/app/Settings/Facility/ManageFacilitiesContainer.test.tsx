import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

import {
  GetManagedFacilitiesDocument,
  GetManagedFacilitiesQuery,
} from "../../../generated/graphql";

import ManageFacilitiesContainer from "./ManageFacilitiesContainer";

const mockFacility = {
  id: "c0d32060-0580-4f8f-9e3d-2e16d65c1629",
  cliaNumber: "99D1234567",
  name: "Testing Site",
};

const store = configureStore([])({
  organization: {
    name: "Organization Name",
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
  },
  facilities: [{ id: mockFacility.id, name: mockFacility.name }],
  facility: { id: mockFacility.id, name: mockFacility.name },
});

const mock = [
  {
    request: {
      query: GetManagedFacilitiesDocument,
    },
    result: {
      data: {
        whoami: {
          organization: {
            internalId: "30b1d934-a877-4b1d-9565-575afd4d797e",
            facilities: [
              {
                id: mockFacility.id,
                cliaNumber: mockFacility.cliaNumber,
                name: mockFacility.name,
              },
            ],
          },
        },
      } as GetManagedFacilitiesQuery,
    },
  },
];

describe("ManageFacilitiesContainer", () => {
  it("displays facilities", async () => {
    render(
      <Provider store={store}>
        <MockedProvider mocks={mock}>
          <MemoryRouter initialEntries={["/facilities"]}>
            <Routes>
              <Route
                path="facilities"
                element={<ManageFacilitiesContainer />}
              />
            </Routes>
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );
    expect(await screen.findByText(mockFacility.name));
    expect(await screen.findByText(mockFacility.cliaNumber));
    expect(await screen.findByText(mockFacility.name));
  });
});
