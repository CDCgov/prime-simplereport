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
  state: "DC",
  id: "",
  email: "",
  streetTwo: "",
  city: "",
  orderingProvider: {
    firstName: "John",
    lastName: "Foo",
    NPI: "some-number",
    street: "736 Jackson Pl NW",
    zipCode: "20503",
    state: "DC",
    middleName: "",
    suffix: "",
    phone: "",
    streetTwo: "",
    city: "",
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
    const saveButton = await screen.findByText("Save changes");
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
    const saveButton = await screen.findByText("Save changes");
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
});
