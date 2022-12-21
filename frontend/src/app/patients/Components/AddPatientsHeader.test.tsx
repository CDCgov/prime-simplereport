import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import { AddPatientHeader } from "./AddPatientsHeader";

describe("patient header", () => {
  const mockStore = createMockStore([]);
  const mockedStore = mockStore({ isAdmin: false });

  it("adds additional properties", async () => {
    render(
      <MemoryRouter>
        <Provider store={mockedStore}>
          <MockedProvider mocks={[]} addTypename={false}>
            <AddPatientHeader
              additional={<div>Additional Properties would be here</div>}
            />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Additional Properties would be here")
    ).toBeInTheDocument();
  });
  it("doesn't include link to bulk patient upload if not an admin", async () => {
    render(
      <MemoryRouter>
        <Provider store={mockedStore}>
          <MockedProvider mocks={[]} addTypename={false}>
            <AddPatientHeader
              additional={<div>Additional Properties would be here</div>}
            />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(
      screen.queryByText("Import from spreadsheet")
    ).not.toBeInTheDocument();
  });
  it("includes link to bulk patient upload if user is an admin", async () => {
    render(
      <MemoryRouter>
        <Provider store={mockStore({ user: { isAdmin: true } })}>
          <MockedProvider mocks={[]} addTypename={false}>
            <AddPatientHeader
              additional={<div>Additional Properties would be here</div>}
            />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Import from spreadsheet")
    ).toBeInTheDocument();
  });
});
