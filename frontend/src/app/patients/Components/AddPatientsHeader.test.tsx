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
  it("includes link to bulk upload for standard users", async () => {
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
      await screen.findByText("Import from spreadsheet")
    ).toBeInTheDocument();
  });
});
