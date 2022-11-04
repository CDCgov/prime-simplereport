import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import * as clia from "../../utils/clia";
import * as state from "../../utils/state";
import * as smartyStreets from "../../utils/smartyStreets";
import SRToastContainer from "../../commonComponents/SRToastContainer";

import FacilityForm from "./FacilityForm";

import "../../../i18n";

let saveFacility: jest.Mock;

const devices: DeviceType[] = [
  {
    internalId: "device-1",
    name: "Device 1",
    supportedDiseases: [],
  },
  {
    internalId: "device-2",
    name: "Device 2",
    supportedDiseases: [],
  },
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
    NPI: "000",
    street: null,
    zipCode: null,
    state: null,
    middleName: null,
    suffix: null,
    phone: "phone",
    streetTwo: null,
    city: null,
  },
  deviceTypes: devices,
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

describe("FacilityForm", () => {
  let getIsValidZipForStateSpy: jest.SpyInstance;
  let getBestSuggestionSpy: jest.SpyInstance;
  let suggestionIsCloseEnoughSpy: jest.SpyInstance;

  beforeEach(() => {
    saveFacility = jest.fn();
    getIsValidZipForStateSpy = jest
      .spyOn(smartyStreets, "isValidZipCodeForState")
      .mockReturnValue(true);
    getBestSuggestionSpy = jest
      .spyOn(smartyStreets, "getBestSuggestion")
      .mockImplementation(
        (address: Address): Promise<AddressWithMetaData | undefined> => {
          const lookup = addresses.find(
            ({ bad }) => bad.street === address.street
          );
          return Promise.resolve(lookup ? lookup.good : undefined);
        }
      );
    suggestionIsCloseEnoughSpy = jest
      .spyOn(smartyStreets, "suggestionIsCloseEnough")
      .mockReturnValue(false);
    jest
      .spyOn(smartyStreets, "getZipCodeData")
      .mockReturnValue(Promise.resolve(undefined));
  });

  afterEach(() => {
    getIsValidZipForStateSpy.mockRestore();
    getBestSuggestionSpy.mockRestore();
    suggestionIsCloseEnoughSpy.mockRestore();
  });

  describe("form submission", () => {
    it("has a link to return to all facilities page", () => {
      render(
        <MemoryRouter>
          <FacilityForm
            facility={validFacility}
            deviceTypes={devices}
            saveFacility={saveFacility}
          />
        </MemoryRouter>
      );
      expect(screen.getByText("Back to all facilities")).toBeInTheDocument();
      expect(screen.getByText("Back to all facilities")).toHaveAttribute(
        "href",
        "/settings/facilities"
      );
    });

    it("submits a valid form", async () => {
      render(
        <MemoryRouter>
          <FacilityForm
            facility={validFacility}
            deviceTypes={devices}
            saveFacility={saveFacility}
          />
        </MemoryRouter>
      );
      const saveButton = await screen.getAllByText("Save changes")[0];
      userEvent.type(
        screen.getByLabelText("Testing facility name", { exact: false }),
        "Bar Facility"
      );
      userEvent.click(saveButton);
      await validateAddress(saveFacility);
    });

    it("provides validation feedback during form completion", async () => {
      render(
        <MemoryRouter>
          <FacilityForm
            facility={validFacility}
            deviceTypes={devices}
            saveFacility={saveFacility}
          />
        </MemoryRouter>
      );
      const facilityNameInput = screen.getByLabelText("Testing facility name", {
        exact: false,
      });
      userEvent.clear(facilityNameInput);
      userEvent.tab();
      const nameWarning = await screen.findByText("Facility name is missing");
      expect(nameWarning).toBeInTheDocument();
      userEvent.type(facilityNameInput, "Test facility A");

      const facilityStreetAddressInput = screen.getAllByLabelText(
        "Street address 1",
        {
          exact: false,
        }
      )[0];
      userEvent.clear(facilityStreetAddressInput);
      userEvent.tab();
      const streetAddressWarning = await screen.findByText(
        "Facility street is missing"
      );
      expect(streetAddressWarning).toBeInTheDocument();
      userEvent.type(facilityStreetAddressInput, "123 Main Street");

      const facilityZipCodeInput = screen.getAllByLabelText("ZIP code", {
        exact: false,
      })[0];
      userEvent.clear(facilityZipCodeInput);
      userEvent.tab();
      const facilityZipCodeWarning = await screen.findByText(
        "Facility zip code is missing"
      );
      expect(facilityZipCodeWarning).toBeInTheDocument();
    });

    it("prevents submit for invalid form", async () => {
      render(
        <MemoryRouter>
          <FacilityForm
            facility={validFacility}
            deviceTypes={devices}
            saveFacility={saveFacility}
          />
        </MemoryRouter>
      );
      const saveButton = await screen.getAllByText("Save changes")[0];
      const facilityNameInput = screen.getByLabelText("Testing facility name", {
        exact: false,
      });
      userEvent.clear(facilityNameInput);
      userEvent.click(saveButton);
      await waitFor(async () => expect(saveButton).toBeEnabled());
      expect(saveFacility).toBeCalledTimes(0);
    });

    it("validates optional email field", async () => {
      render(
        <MemoryRouter>
          <FacilityForm
            facility={validFacility}
            deviceTypes={devices}
            saveFacility={saveFacility}
          />
        </MemoryRouter>
      );
      const saveButton = (await screen.findAllByText("Save changes"))[0];
      const emailInput = screen.getByLabelText("Email", {
        exact: false,
      });
      userEvent.type(emailInput, "123-456-7890");
      userEvent.tab();

      expect(
        await screen.findByText("Email is incorrectly formatted", {
          exact: false,
        })
      ).toBeInTheDocument();

      userEvent.click(saveButton);
      expect(saveFacility).toBeCalledTimes(0);

      userEvent.type(emailInput, "foofacility@example.com");
      userEvent.click(saveButton);
      await waitFor(async () => expect(saveButton).toBeEnabled());
      await validateAddress(saveFacility);
    });

    it("only accepts live jurisdictions", async () => {
      render(
        <MemoryRouter>
          <FacilityForm
            facility={validFacility}
            deviceTypes={devices}
            saveFacility={saveFacility}
          />
        </MemoryRouter>
      );
      const stateDropdownElement = screen.getByTestId(
        "facility-state-dropdown"
      );
      userEvent.selectOptions(stateDropdownElement, "PW");
      userEvent.tab();
      // There's a line break between these two statements, so they have to be separated
      const warning = await screen.findByText(
        "SimpleReport isn’t currently supported in",
        { exact: false }
      );
      expect(warning).toBeInTheDocument();
      const state = await screen.findByText("Palau", { exact: false });
      expect(state).toBeInTheDocument();
    });

    it("focuses on error with facility name", async () => {
      render(
        <MemoryRouter>
          <FacilityForm
            facility={validFacility}
            deviceTypes={devices}
            saveFacility={saveFacility}
          />
        </MemoryRouter>
      );
      const saveButton = screen.getAllByText("Save changes")[0];
      userEvent.clear(
        screen.getByLabelText("Testing facility name", { exact: false })
      );
      userEvent.click(saveButton);
      await waitFor(() =>
        expect(
          screen.getByLabelText("Testing facility name", { exact: false })
        ).toHaveFocus()
      );
    });
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
              deviceTypes={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        userEvent.type(cliaInput, "12F3456789");
        userEvent.tab();

        const expectedError = "CLIA number should be 10 characters";

        expect(
          await screen.findByText(expectedError, {
            exact: false,
          })
        ).toBeInTheDocument();

        const saveButton = screen.getAllByText("Save changes")[0];
        userEvent.click(saveButton);
        await waitFor(async () => expect(saveButton).toBeEnabled());
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
              deviceTypes={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });
        userEvent.type(cliaInput, "invalid-clia-number");
        userEvent.tab();

        const saveButton = await screen.getAllByText("Save changes")[0];
        userEvent.click(saveButton);
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
              deviceTypes={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        userEvent.clear(cliaInput);
        userEvent.type(cliaInput, "12Z3456789");
        userEvent.tab();

        const saveButton = await screen.getAllByText("Save changes")[0];
        userEvent.click(saveButton);
        await validateAddress(saveFacility);
        expect(saveFacility).toBeCalledTimes(1);
      });

      it("doesn't allow a Z-CLIA for a non-Washington state", async () => {
        const marylandFacility: Facility = validFacility;
        marylandFacility.state = "MD";
        render(
          <MemoryRouter>
            <FacilityForm
              facility={marylandFacility}
              deviceTypes={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        userEvent.clear(cliaInput);
        userEvent.type(cliaInput, "12Z3456789");
        userEvent.tab();

        const expectedError =
          "Special temporary CLIAs are only valid in CA, IL, VT, WA, and WY.";

        expect(
          await screen.findByText(expectedError, {
            exact: false,
          })
        ).toBeInTheDocument();

        const saveButton = screen.getAllByText("Save changes")[0];
        userEvent.click(saveButton);
        await waitFor(async () => expect(saveButton).toBeEnabled());
        expect(saveFacility).toBeCalledTimes(0);
      });

      it("allows alphanumeric characters for California", async () => {
        const californiaFacility: Facility = validFacility;
        californiaFacility.state = "CA";

        render(
          <MemoryRouter>
            <FacilityForm
              facility={californiaFacility}
              deviceTypes={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        userEvent.clear(cliaInput);
        userEvent.type(cliaInput, "CPDH000006");
        userEvent.tab();

        const saveButton = await screen.getAllByText("Save changes")[0];
        userEvent.click(saveButton);
        await validateAddress(saveFacility);
        expect(saveFacility).toBeCalledTimes(1);
      });

      it("allows 47ZXXXXXXX pattern for VT", async () => {
        const vermontFacility: Facility = validFacility;
        vermontFacility.state = "VT";

        render(
          <MemoryRouter>
            <FacilityForm
              facility={vermontFacility}
              deviceTypes={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        userEvent.clear(cliaInput);
        userEvent.type(cliaInput, "47Z1234567");
        userEvent.tab();

        const saveButton = await screen.getAllByText("Save changes")[0];
        userEvent.click(saveButton);
        await validateAddress(saveFacility);
        expect(saveFacility).toBeCalledTimes(1);
      });

      it("allows 32ZXXXXXXX pattern for NM", async () => {
        const newMexicoFacility: Facility = validFacility;
        newMexicoFacility.state = "NM";

        render(
          <MemoryRouter>
            <FacilityForm
              facility={newMexicoFacility}
              deviceTypes={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        userEvent.clear(cliaInput);
        userEvent.type(cliaInput, "32Z1234567");
        userEvent.tab();

        const saveButton = await screen.getAllByText("Save changes")[0];
        userEvent.click(saveButton);
        await validateAddress(saveFacility);
        expect(saveFacility).toBeCalledTimes(1);
      });
    });
  });

  describe("Ordering provider validation", () => {
    describe("when validation is required for state", () => {
      let spy: jest.SpyInstance;

      beforeEach(() => {
        spy = jest.spyOn(state, "requiresOrderProvider").mockReturnValue(true);
      });

      afterEach(() => {
        spy.mockRestore();
      });

      it("displays error message and prevents form submission if required order provider fields not populated", async () => {
        render(
          <MemoryRouter>
            <FacilityForm
              facility={validFacility}
              deviceTypes={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const npiInput = screen.getByLabelText("NPI", {
          exact: false,
        });

        userEvent.clear(npiInput);
        userEvent.tab();

        const expectedError = "Ordering provider NPI is incorrectly formatted";

        // The mock function was called at least once
        expect(spy.mock.calls.length).toBeGreaterThan(0);
        expect(
          await screen.findByText(expectedError, {
            exact: false,
          })
        ).toBeInTheDocument();

        const saveButton = screen.getAllByText("Save changes")[0];
        userEvent.click(saveButton);
        await waitFor(async () => expect(saveButton).toBeEnabled());
        expect(saveFacility).toBeCalledTimes(0);
      });

      it("requires a valid NPI (digits only)", async () => {
        render(
          <MemoryRouter>
            <FacilityForm
              facility={validFacility}
              deviceTypes={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const npiInput = screen.getByLabelText("NPI", {
          exact: false,
        });

        userEvent.clear(npiInput);
        userEvent.type(npiInput, "Facility name");
        userEvent.tab();

        const expectedError = "Ordering provider NPI is incorrectly formatted";
        // The mock function was called at least once
        expect(spy.mock.calls.length).toBeGreaterThan(0);
        expect(
          await screen.findByText(expectedError, {
            exact: false,
          })
        ).toBeInTheDocument();

        const saveButton = screen.getAllByText("Save changes")[0];
        userEvent.click(saveButton);
        await waitFor(async () => expect(saveButton).toBeEnabled());
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
              deviceTypes={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
        );

        const npiInput = screen.getByLabelText("NPI", {
          exact: false,
        });
        userEvent.clear(npiInput);
        userEvent.tab();

        // The spy function was called at least once
        expect(spy.mock.calls.length).toBeGreaterThan(0);

        const saveButton = await screen.getAllByText("Save changes")[0];
        userEvent.click(saveButton);
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
            deviceTypes={devices}
            saveFacility={saveFacility}
          />
        </MemoryRouter>
      );
      const saveButton = screen.getAllByText("Save changes")[0];
      const facilityName = screen.getByLabelText("Testing facility name", {
        exact: false,
      });
      userEvent.clear(facilityName);
      userEvent.type(facilityName, "La Croix Facility");
      userEvent.click(saveButton);
      await validateAddress(saveFacility, "suggested address");
      expect(getIsValidZipForStateSpy).toBeCalledTimes(1);
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

    it("blocks submission of facility on invalid ZIP code for state", async () => {
      // GIVEN
      getIsValidZipForStateSpy.mockRestore();
      getIsValidZipForStateSpy = jest
        .spyOn(smartyStreets, "isValidZipCodeForState")
        .mockReturnValue(false);

      const facility = validFacility;

      // WHEN
      render(
        <>
          <MemoryRouter>
            <FacilityForm
              facility={facility}
              deviceTypes={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
          <SRToastContainer />
        </>
      );

      const facilityName = await screen.findByLabelText(
        "Testing facility name",
        {
          exact: false,
        }
      );
      userEvent.clear(facilityName);
      userEvent.type(facilityName, "La Croix Facility");
      const saveButton = (await screen.findAllByText("Save changes"))[0];
      userEvent.click(saveButton);

      // THEN
      // Toast alert appears
      expect(
        await screen.findByText("Invalid ZIP code for this state", {
          exact: false,
        })
      ).toBeInTheDocument();

      expect(getIsValidZipForStateSpy).toBeCalledTimes(1);

      // Does not perform further address validation on invalid ZIP code for state
      expect(getBestSuggestionSpy).not.toHaveBeenCalled();
    });
  });

  describe("Device validation", () => {
    beforeEach(() => {
      render(
        <MemoryRouter>
          <FacilityForm
            facility={validFacility}
            deviceTypes={devices}
            saveFacility={saveFacility}
          />
        </MemoryRouter>
      );
    });

    it("warns about missing device selection", async () => {
      await deleteAllDevices();

      await screen.findByText("There are currently no devices", {
        exact: false,
      });

      await attemptSaveDevices();

      await screen.findByText("There must be at least one device", {
        exact: false,
      });
    });

    it("resolves the error when a device is selected", async () => {
      await deleteAllDevices();

      await screen.findByText("There are currently no devices", {
        exact: false,
      });

      await attemptSaveDevices();

      await screen.findByText("There must be at least one device", {
        exact: false,
      });

      // Select Device
      const deviceInput = screen.getByTestId("multi-select-toggle");
      const deviceList = screen.getByTestId("multi-select-option-list");
      userEvent.click(deviceInput);
      userEvent.click(within(deviceList).getByText("Device 1"));

      // Expect no errors
      expect(
        screen.queryByText("There are currently no devices", {
          exact: false,
        })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("There must be at least one device", {
          exact: false,
        })
      ).not.toBeInTheDocument();
    });
  });
});

async function attemptSaveDevices() {
  const saveButtons = await screen.findAllByText("Save changes");
  await waitFor(async () => expect(saveButtons[0]).toBeEnabled());
  userEvent.click(saveButtons[0]);
}

async function deleteAllDevices() {
  const pillContainer = screen.getByTestId("pill-container");
  const deleteButtons = within(pillContainer).getAllByRole("button");
  deleteButtons.forEach((button) => fireEvent.click(button));
}

async function validateAddress(
  saveFacility: (facility: Facility) => void,
  selection: "as entered" | "suggested address" = "as entered"
) {
  await screen.findByText("Address validation");
  const radios = screen.getAllByLabelText(selection, { exact: false });
  radios.forEach((r) => userEvent.click(r));
  const button = screen.getAllByText("Save changes")[2];
  expect(button).toBeEnabled();
  userEvent.click(button);
  expect(saveFacility).toBeCalledTimes(1);
}
