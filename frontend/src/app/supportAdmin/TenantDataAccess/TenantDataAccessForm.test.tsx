import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import configureStore, { MockStore } from "redux-mock-store";
import { Provider } from "react-redux";

import { OrganizationOption } from "../Components/OrganizationComboDropdown";

import TenantDataAccessForm from "./TenantDataAccessForm";

let saveTenantDataAccess: jest.Mock;

const organizations: OrganizationOption[] = [
  { name: "Org 1 Name", externalId: "ORG_1" },
  { name: "Org 2 Name", externalId: "ORG_2" },
];

const mockStore = configureStore([]);

describe("TenantDataAccessForm", () => {
  let store: MockStore;
  beforeEach(() => {
    saveTenantDataAccess = jest.fn();
    store = mockStore({
      organization: {
        name: "Org 1 Name",
      },
    });
  });

  const renderWithUser = (store: MockStore) => ({
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <TenantDataAccessForm
            organizationOptions={organizations}
            organizationExternalId=""
            justification=""
            saveTenantDataAccess={saveTenantDataAccess}
          />
        </MemoryRouter>
      </Provider>
    ),
  });

  it("Submits a valid access form", async () => {
    const { user } = renderWithUser(store);
    // using the default test id that comes with the trusswork component
    await user.selectOptions(
      screen.getByTestId("combo-box-select"),
      "Org 1 Name"
    );
    await user.type(
      screen.getByLabelText("Justification", { exact: false }),
      "sample justification text"
    );
    const saveButton = screen.getAllByText("Access data")[0];
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);
    expect(saveTenantDataAccess).toBeCalledTimes(1);
  });
  it("selecting/clearing org enables/disables access", async () => {
    const { user } = renderWithUser(store);
    await user.selectOptions(
      screen.getByTestId("combo-box-select"),
      "Org 2 Name"
    );
    const saveButton = screen.getAllByText("Access data")[0];
    await user.type(
      screen.getByLabelText("Justification", { exact: false }),
      "sample justification text"
    );
    expect(saveButton).toBeEnabled();
    await user.click(screen.getByTestId("combo-box-clear-button"));
    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it("Submits a cancellation form", async () => {
    const { user } = renderWithUser(store);
    // using the default test id that comes with the trusswork component
    await user.selectOptions(
      screen.getByTestId("combo-box-select"),
      "Org 1 Name"
    );
    await user.type(
      screen.getByLabelText("Justification", { exact: false }),
      "sample justification text"
    );
    const cancelButton = await screen.getAllByText("Cancel access")[0];
    expect(cancelButton).toBeEnabled();
    await user.click(cancelButton);
    expect(saveTenantDataAccess).toBeCalledTimes(1);
  });

  it("Cancel button always enabled", async () => {
    const { user } = renderWithUser(store);
    const cancelButton = await screen.getAllByText("Cancel access")[0];
    expect(cancelButton).toBeEnabled();
    await user.click(cancelButton);
    expect(saveTenantDataAccess).toBeCalledTimes(1);
  });
});
