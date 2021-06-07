import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import OrganizationForm from "./OrganizationForm";

let saveOrganization: jest.Mock;

const devices: DeviceType[] = [
  { internalId: "device-1", name: "Device 1" },
  { internalId: "device-2", name: "Device 2" },
];

const validFacility: Facility = {
  name: "Foo Facility",
  cliaNumber: "12D4567890",
  phone: "(202) 395-3080",
  street: "736 Jackson Pl NW",
  zipCode: "20503",
  state: "AZ",
  id: "some-id",
  email: null,
  streetTwo: null,
  city: null,
  orderingProvider: {
    firstName: "Frank",
    lastName: "Grimes",
    NPI: "npi",
    street: null,
    zipCode: null,
    state: null,
    middleName: null,
    suffix: null,
    phone: "phone",
    streetTwo: null,
    city: null,
  },
  deviceTypes: devices.map(({ internalId }) => internalId),
  defaultDevice: devices[0].internalId,
};

const validOrganization: Organization = {
  name: "Dis Org",
  internalId: "12345",
  externalId: "678910",
  testingFacility: [validFacility],
};

const validAdmin: FacilityAdmin = {
  firstName: "Bob",
  middleName: "Bill",
  lastName: "Barker",
  suffix: "Sr",
  email: "bob@barker.com",
};

describe("OrganizationForm", () => {
  beforeEach(() => {
    saveOrganization = jest.fn();
  });
  it("submits a valid form", async () => {
    render(
      <MemoryRouter>
        <OrganizationForm
          organization={validOrganization}
          facility={validFacility}
          admin={validAdmin}
          deviceOptions={devices}
          saveOrganization={saveOrganization}
        />
      </MemoryRouter>
    );
    const saveButton = await screen.findByText("Save Changes");
    fireEvent.change(
      screen.getByLabelText("Testing facility name", { exact: false }),
      { target: { value: "Dat Facility" } }
    );
    await waitFor(() => {
      fireEvent.click(saveButton);
      expect(saveOrganization).toBeCalled();
    });
  });
  it("provides validation feedback during form completion", async () => {
    render(
      <MemoryRouter>
        <OrganizationForm
          organization={validOrganization}
          facility={validFacility}
          admin={validAdmin}
          deviceOptions={devices}
          saveOrganization={saveOrganization}
        />
      </MemoryRouter>
    );
    const facilityNameInput = screen.getByLabelText("Testing facility name", {
      exact: false,
    });
    fireEvent.change(facilityNameInput, { target: { value: "" } });
    fireEvent.blur(facilityNameInput);
    const warning = await screen.findByText("Facility name is missing");
    expect(warning).toBeInTheDocument();
  });
  it("prevents submit for invalid form", async () => {
    render(
      <MemoryRouter>
        <OrganizationForm
          organization={validOrganization}
          facility={validFacility}
          admin={validAdmin}
          deviceOptions={devices}
          saveOrganization={saveOrganization}
        />
      </MemoryRouter>
    );
    const saveButton = await screen.findByText("Save Changes");
    const facilityNameInput = screen.getByLabelText("Testing facility name", {
      exact: false,
    });
    await waitFor(() => {
      fireEvent.change(facilityNameInput, { target: { value: "" } });
    });
    await waitFor(async () => {
      fireEvent.click(saveButton);
    });
    expect(saveOrganization).toBeCalledTimes(0);
  });
  it("validates optional email field", async () => {
    render(
      <MemoryRouter>
        <OrganizationForm
          organization={validOrganization}
          facility={validFacility}
          admin={validAdmin}
          deviceOptions={devices}
          saveOrganization={saveOrganization}
        />
      </MemoryRouter>
    );
    const saveButton = await screen.findByText("Save Changes");
    const emailInput = screen.getByTestId("facility-email");
    fireEvent.change(emailInput, { target: { value: "123-456-7890" } });
    fireEvent.blur(emailInput);

    expect(
      await screen.findByText("Email is incorrectly formatted", {
        exact: false,
      })
    ).toBeInTheDocument();

    await waitFor(async () => {
      fireEvent.click(saveButton);
    });
    expect(saveOrganization).toBeCalledTimes(0);

    fireEvent.change(emailInput, {
      target: { value: "foofacility@example.com" },
    });
    await waitFor(async () => {
      fireEvent.click(saveButton);
    });
    expect(saveOrganization).toBeCalledTimes(1);
  });
});
