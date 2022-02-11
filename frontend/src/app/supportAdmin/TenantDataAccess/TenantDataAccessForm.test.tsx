import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
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
  beforeEach(() => {
    saveTenantDataAccess = jest.fn();
    const store = mockStore({
      organization: {
        name: "Org 1 Name",
      },
    });
    render(
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
    );
  });

  it("Submits a valid access form", async () => {
    // using the default test id that comes with the trusswork component
    userEvent.selectOptions(
      screen.getByTestId("combo-box-select"),
      "Org 1 Name"
    );
    userEvent.type(
      screen.getByLabelText("Justification", { exact: false }),
      "sample justification text"
    );
    const saveButton = screen.getAllByText("Access data")[0];
    expect(saveButton).toBeEnabled();
    userEvent.click(saveButton);
    expect(saveTenantDataAccess).toBeCalledTimes(1);
  });
  it("selecting/clearing org enables/disables access", () => {
    userEvent.click(screen.getByTestId("combo-box-select"));
    userEvent.click(screen.getByTestId("combo-box-option-ORG_2"));
    const saveButton = screen.getAllByText("Access data")[0];
    userEvent.type(
      screen.getByLabelText("Justification", { exact: false }),
      "sample justification text"
    );
    expect(saveButton).toBeEnabled();
    userEvent.click(screen.getByTestId("combo-box-clear-button"));
    expect(saveButton).toBeDisabled();
  });

  it("Submits a cancellation form", async () => {
    // using the default test id that comes with the trusswork component
    userEvent.selectOptions(
      screen.getByTestId("combo-box-select"),
      "Org 1 Name"
    );
    userEvent.type(
      screen.getByLabelText("Justification", { exact: false }),
      "sample justification text"
    );
    const cancelButton = await screen.getAllByText("Cancel access")[0];
    expect(cancelButton).toBeEnabled();
    userEvent.click(cancelButton);
    expect(saveTenantDataAccess).toBeCalledTimes(1);
  });

  it("Cancel button always enabled", async () => {
    const cancelButton = await screen.getAllByText("Cancel access")[0];
    expect(cancelButton).toBeEnabled();
    userEvent.click(cancelButton);
    expect(saveTenantDataAccess).toBeCalledTimes(1);
  });
});
