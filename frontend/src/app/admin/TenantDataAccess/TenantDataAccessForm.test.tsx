import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

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
    const organizationDropdown = screen.getByTestId("organization-dropdown");
    fireEvent.change(organizationDropdown, {
      target: { selectedValue: organizations[0].externalId },
    });
    fireEvent.change(organizationDropdown, {
      target: { value: organizations[0].externalId },
    });
    await waitFor(async () => {
      fireEvent.blur(organizationDropdown);
    });
    fireEvent.change(screen.getByLabelText("Justification", { exact: false }), {
      target: { value: "sample justification text" },
    });
    const saveButton = await screen.getAllByText("Access data")[0];
    expect(saveButton).toBeEnabled();
    await waitFor(async () => {
      fireEvent.click(saveButton);
    });
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
    const organizationDropdown = screen.getByTestId("organization-dropdown");
    fireEvent.change(organizationDropdown, {
      target: { selectedValue: organizations[0].externalId },
    });
    fireEvent.change(organizationDropdown, {
      target: { value: organizations[0].externalId },
    });
    await waitFor(async () => {
      fireEvent.blur(organizationDropdown);
    });
    fireEvent.change(screen.getByLabelText("Justification", { exact: false }), {
      target: { value: "sample justification text" },
    });
    const cancelButton = await screen.getAllByText("Cancel access")[0];
    expect(cancelButton).toBeEnabled();
    await waitFor(async () => {
      fireEvent.click(cancelButton);
    });
    expect(saveTenantDataAccess).toBeCalledTimes(1);
  });
});
