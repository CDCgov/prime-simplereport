import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { OrganizationOption } from "../Components/OrganizationDropDown";

import TenantDataAccessForm from "./TenantDataAccessForm";

let saveTenantDataAccess: jest.Mock;

const organizations: OrganizationOption[] = [
  { name: "Org 1 Name", externalId: "ORG_1" },
  { name: "Org 2 Name", externalId: "ORG_2" },
];

describe("TenantDataAccessForm", () => {
  beforeEach(() => {
    saveTenantDataAccess = jest.fn();
  });

  it("Submits a valid access form", async () => {
    render(
      <MemoryRouter>
        <TenantDataAccessForm
          organizationOptions={organizations}
          organizationExternalId=""
          justification=""
          saveTenantDataAccess={saveTenantDataAccess}
        />
      </MemoryRouter>
    );
    userEvent.selectOptions(
      screen.getByTestId("organization-dropdown"),
      "Org 1 Name"
    );
    userEvent.type(
      screen.getByLabelText("Justification", { exact: false }),
      "sample justification text"
    );
    const saveButton = await screen.getAllByText("Access data")[0];
    expect(saveButton).toBeEnabled();
    userEvent.click(saveButton);
    expect(saveTenantDataAccess).toBeCalledTimes(1);
  });

  it("Submits a cancellation form", async () => {
    render(
      <MemoryRouter>
        <TenantDataAccessForm
          organizationOptions={organizations}
          organizationExternalId=""
          justification=""
          saveTenantDataAccess={saveTenantDataAccess}
        />
      </MemoryRouter>
    );
    userEvent.selectOptions(
      screen.getByTestId("organization-dropdown"),
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
    render(
      <MemoryRouter>
        <TenantDataAccessForm
          organizationOptions={organizations}
          organizationExternalId=""
          justification=""
          saveTenantDataAccess={saveTenantDataAccess}
        />
      </MemoryRouter>
    );
    const cancelButton = await screen.getAllByText("Cancel access")[0];
    expect(cancelButton).toBeEnabled();
    userEvent.click(cancelButton);
    expect(saveTenantDataAccess).toBeCalledTimes(1);
  });
});
