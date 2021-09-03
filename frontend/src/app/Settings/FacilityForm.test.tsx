import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import * as clia from "../utils/clia";
import * as state from "../utils/state";

import FacilityForm from "./Facility/FacilityForm";
import "../../i18n";

let saveFacility: jest.Mock;

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

// Hardcoded suggestion scenarios
const addresses = [
  {
    bad: {
      street: "123 Main St",
      streetTwo: "Unit 05",
      city: "Wasington",
      state: "AZ",
      zipCode: "13345",
      county: "",
    },
    good: {
      street: "123 Main St NW",
      streetTwo: "Unit 50",
      city: "Washington",
      state: "AZ",
      zipCode: "12345",
      county: "Potomac",
    },
  },
  {
    bad: {
      street: "827 Piedmont St",
      streetTwo: "",
      city: "Alexandria",
      state: "FL",
      zipCode: "22222",
      county: "",
    },
    good: {
      street: "827 Piedmont Dr.",
      streetTwo: "",
      city: "Arlington",
      state: "FL",
      zipCode: "22212",
      county: "Alexandria",
    },
  },
];

jest.mock("../utils/smartyStreets", () => ({
  getBestSuggestion: (
    address: Address
  ): Promise<AddressWithMetaData | undefined> => {
    const lookup = addresses.find(({ bad }) => bad.street === address.street);
    return Promise.resolve(lookup ? lookup.good : undefined);
  },
  suggestionIsCloseEnough: () => false,
}));

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
    fireEvent.click(saveButton);
    await validateAddress(saveFacility);
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
    const saveButton = (await screen.findAllByText("Save changes"))[0];
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
    await validateAddress(saveFacility);
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

  describe("CLIA number validation", () => {
    describe("when validation is required for state", () => {
      beforeEach(() => {
        jest
          .spyOn(clia, "stateRequiresCLIANumberValidation")
          .mockReturnValue(true);
      });

      afterEach(() => {
        jest.spyOn(clia, "stateRequiresCLIANumberValidation").mockRestore();
      });

      it("displays an error if CLIA number is invalid and prevents form submission", async () => {
        render(
          <MemoryRouter>
            <FacilityForm
              facility={validFacility}
              deviceOptions={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        fireEvent.change(cliaInput, {
          target: { value: "12Z3456789" },
        });
        fireEvent.blur(cliaInput);

        const expectedError = "CLIA number should be 10 characters";

        expect(
          await screen.findByText(expectedError, {
            exact: false,
          })
        ).toBeInTheDocument();

        const saveButton = screen.getAllByText("Save changes")[0];
        await waitFor(async () => {
          fireEvent.click(saveButton);
        });
        expect(saveFacility).toBeCalledTimes(0);
      });
    });

    describe("when validation is not required for state", () => {
      beforeEach(() => {
        jest
          .spyOn(clia, "stateRequiresCLIANumberValidation")
          .mockReturnValue(false);
      });

      afterEach(() => {
        jest.spyOn(clia, "stateRequiresCLIANumberValidation").mockRestore();
      });

      it("does not validate CLIA numbers in states that do not require it", async () => {
        render(
          <MemoryRouter>
            <FacilityForm
              facility={validFacility}
              deviceOptions={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });
        fireEvent.change(cliaInput, {
          target: { value: "invalid-clia-number" },
        });
        fireEvent.blur(cliaInput);

        const saveButton = await screen.getAllByText("Save changes")[0];
        fireEvent.click(saveButton);
        await validateAddress(saveFacility);
        expect(saveFacility).toBeCalledTimes(1);
      });
    });

    describe("allows fake Z-CLIAs for permitted states", () => {
      beforeEach(() => {
        jest
          .spyOn(clia, "stateRequiresCLIANumberValidation")
          .mockReturnValue(true);
      });

      afterEach(() => {
        jest.spyOn(clia, "stateRequiresCLIANumberValidation").mockRestore();
      });

      it("allows Z-CLIA for Washington state only", async () => {
        const washingtonFacility: Facility = validFacility;
        washingtonFacility.state = "WA";

        render(
          <MemoryRouter>
            <FacilityForm
              facility={washingtonFacility}
              deviceOptions={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        fireEvent.change(cliaInput, {
          target: { value: "12Z3456789" },
        });
        fireEvent.blur(cliaInput);

        const saveButton = await screen.getAllByText("Save changes")[0];
        fireEvent.click(saveButton);
        await validateAddress(saveFacility);
        expect(saveFacility).toBeCalledTimes(1);
      });
    });
  });

  describe("Ordering provider validation", () => {
    describe("when validation is required for state", () => {
      let spy: jest.SpyInstance;

      beforeEach(() => {
        spy = jest.spyOn(state, "requiresOrderProvider");
        spy.mockReturnValue(true);
      });

      afterEach(() => {
        spy.mockRestore();
      });

      it("displays error message and prevents form submission if required order provider fields not populated", async () => {
        render(
          <MemoryRouter>
            <FacilityForm
              facility={validFacility}
              deviceOptions={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const npiInput = screen.getByLabelText("NPI", {
          exact: false,
        });

        fireEvent.change(npiInput, {
          target: { value: null },
        });
        fireEvent.blur(npiInput);

        const expectedError = "Ordering provider NPI is incorrectly formatted";

        // The mock function was called at least once
        expect(spy.mock.calls.length).toBeGreaterThan(0);
        expect(
          await screen.findByText(expectedError, {
            exact: false,
          })
        ).toBeInTheDocument();

        const saveButton = screen.getAllByText("Save changes")[0];
        await waitFor(async () => {
          fireEvent.click(saveButton);
        });
        expect(saveFacility).toBeCalledTimes(0);
      });
    });

    describe("when validation is not required for state", () => {
      let spy: jest.SpyInstance;

      beforeEach(() => {
        spy = jest.spyOn(state, "requiresOrderProvider");
        spy.mockReturnValue(false);
      });

      afterEach(() => {
        spy.mockRestore();
      });

      it("does not validate ordering provider fields", async () => {
        render(
          <MemoryRouter>
            <FacilityForm
              facility={validFacility}
              deviceOptions={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const npiInput = screen.getByLabelText("NPI", {
          exact: false,
        });
        fireEvent.change(npiInput, {
          target: { value: null },
        });
        fireEvent.blur(npiInput);

        // The spy function was called at least once
        expect(spy.mock.calls.length).toBeGreaterThan(0);

        const saveButton = await screen.getAllByText("Save changes")[0];
        fireEvent.click(saveButton);
        await validateAddress(saveFacility);
        expect(saveFacility).toBeCalledTimes(1);
      });
    });
  });

  describe("Address validation", () => {
    it("uses suggested addresses", async () => {
      const facility: Facility = {
        ...validFacility,
        ...addresses[0].bad,
        orderingProvider: {
          ...validFacility.orderingProvider,
          ...addresses[1].bad,
        },
      };
      render(
        <MemoryRouter>
          <FacilityForm
            facility={facility}
            deviceOptions={devices}
            saveFacility={saveFacility}
          />
        </MemoryRouter>
      );
      const saveButton = screen.getAllByText("Save changes")[0];
      fireEvent.change(
        screen.getByLabelText("Testing facility name", { exact: false }),
        { target: { value: "La Croix Facility" } }
      );
      fireEvent.click(saveButton);
      await validateAddress(saveFacility, "suggested address");
      expect(saveFacility).toBeCalledWith({
        ...validFacility,
        name: "La Croix Facility",
        ...addresses[0].good,
        orderingProvider: {
          ...validFacility.orderingProvider,
          ...addresses[1].good,
        },
      });
    });
  });

  describe("Device validation", () => {
    it("warns about missing default device", async () => {
      render(
        <MemoryRouter>
          <FacilityForm
            facility={validFacility}
            deviceOptions={devices}
            saveFacility={saveFacility}
          />
        </MemoryRouter>
      );
      // Delete default device
      const deleteButtons = await screen.findAllByLabelText("Delete device");
      await waitFor(() => {
        fireEvent.click(deleteButtons[0]);
      });
      // Attempt save
      const saveButtons = await screen.findAllByText("Save changes");
      fireEvent.click(saveButtons[0]);
      const warning = await screen.findByText(
        "A default device must be selected",
        { exact: false }
      );
      expect(warning).toBeInTheDocument();
    });
  });
});

async function validateAddress(
  saveFacility: (facility: Facility) => void,
  selection: "as entered" | "suggested address" = "as entered"
) {
  await screen.findByText("Address validation");
  const radios = screen.getAllByLabelText(selection, { exact: false });
  radios.forEach(fireEvent.click);
  const button = screen.getAllByText("Save changes")[2];
  expect(button).not.toBeDisabled();
  fireEvent.click(button);
  expect(saveFacility).toBeCalledTimes(1);
}
