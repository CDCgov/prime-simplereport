import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import FacilityForm from "./Facility/FacilityForm";

let saveFacility: jest.Mock;

const devices: DeviceType[] = [
  { internalId: "device-1", name: "Device 1" },
  { internalId: "device-2", name: "Device 2" },
];

const validFacility: Facility = {
  name: "Foo Facility",
  cliaNumber: "some-number",
  phone: "(202) 395-3080",
  street: "736 Jackson Pl NW",
  zipCode: "20503",
  state: "AZ",
  id: "some-id",
  email: null,
  streetTwo: null,
  city: null,
  orderingProvider: {
    firstName: null,
    lastName: null,
    NPI: null,
    street: null,
    zipCode: null,
    state: null,
    middleName: null,
    suffix: null,
    phone: null,
    streetTwo: null,
    city: null,
  },
  deviceTypes: devices.map(({ internalId }) => internalId),
  defaultDevice: devices[0].internalId,
};

describe("FacilityForm", () => {
  beforeEach(() => {
    saveFacility = jest.fn();
  });
  it("submits a valid form", async () => {
    render(
      <MemoryRouter>
        <FacilityForm
          facility={validFacility}
          deviceOptions={devices}
          saveFacility={saveFacility}
        />
      </MemoryRouter>
    );
    const saveButton = await screen.getAllByText("Save changes")[0];
    fireEvent.change(
      screen.getByLabelText("Testing facility name", { exact: false }),
      { target: { value: "Bar Facility" } }
    );
    await waitFor(() => {
      fireEvent.click(saveButton);
      expect(saveFacility).toBeCalled();
    });
  });
  it("provides validation feedback during form completion", async () => {
    render(
      <MemoryRouter>
        <FacilityForm
          facility={validFacility}
          deviceOptions={devices}
          saveFacility={saveFacility}
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
        <FacilityForm
          facility={validFacility}
          deviceOptions={devices}
          saveFacility={saveFacility}
        />
      </MemoryRouter>
    );
    const saveButton = await screen.getAllByText("Save changes")[0];
    const facilityNameInput = screen.getByLabelText("Testing facility name", {
      exact: false,
    });
    await waitFor(() => {
      fireEvent.change(facilityNameInput, { target: { value: "" } });
    });
    await waitFor(async () => {
      fireEvent.click(saveButton);
    });
    expect(saveFacility).toBeCalledTimes(0);
  });
  it("validates optional email field", async () => {
    render(
      <MemoryRouter>
        <FacilityForm
          facility={validFacility}
          deviceOptions={devices}
          saveFacility={saveFacility}
        />
      </MemoryRouter>
    );
    const saveButton = await screen.getAllByText("Save changes")[0];
    const emailInput = screen.getByLabelText("Email", {
      exact: false,
    });
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
    expect(saveFacility).toBeCalledTimes(0);

    fireEvent.change(emailInput, {
      target: { value: "foofacility@example.com" },
    });
    await waitFor(async () => {
      fireEvent.click(saveButton);
    });
    expect(saveFacility).toBeCalledTimes(1);
  });
  it("only accepts live jurisdictions", async () => {
    render(
      <MemoryRouter>
        <FacilityForm
          facility={validFacility}
          deviceOptions={devices}
          saveFacility={saveFacility}
        />
      </MemoryRouter>
    );
    const stateDropdownElement = screen.getByTestId("facility-state-dropdown");
    fireEvent.change(stateDropdownElement, { target: { selectedValue: "PW" } });
    fireEvent.change(stateDropdownElement, { target: { value: "PW" } });
    await waitFor(async () => {
      fireEvent.blur(stateDropdownElement);
    });

    // There's a line break between these two statements, so they have to be separated
    const warning = await screen.findByText(
      "SimpleReport isn’t currently supported in",
      { exact: false }
    );
    expect(warning).toBeInTheDocument();
    const state = await screen.findByText("Palau", { exact: false });
    expect(state).toBeInTheDocument();
  });
});
