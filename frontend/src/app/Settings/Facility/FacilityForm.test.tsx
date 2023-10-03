import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import * as clia from "../../utils/clia";
import * as state from "../../utils/state";
import * as smartyStreets from "../../utils/smartyStreets";
import SRToastContainer from "../../commonComponents/SRToastContainer";
import mockSupportedDiseaseTestPerformedCovid from "../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedCovid";
import "../../../i18n";
import { DeviceType } from "../../../generated/graphql";

import FacilityForm from "./FacilityForm";

let saveFacility: jest.Mock;

const devices: DeviceType[] = [
  {
    internalId: "device-1",
    name: "Device 1",
    model: "Device 1",
    manufacturer: "Manufacturer 1",
    supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedCovid,
    swabTypes: [],
    testLength: 10,
  },
  {
    internalId: "device-2",
    name: "Device 2",
    model: "Device 2",
    manufacturer: "Manufacturer 2",
    supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedCovid,
    swabTypes: [],
    testLength: 10,
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
    NPI: "1231231231",
    street: null,
    zipCode: null,
    state: null,
    middleName: null,
    suffix: null,
    phone: "2015592381",
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
      city: "Washington",
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

  const renderWithUser = (facility = validFacility) => ({
    user: userEvent.setup(),
    ...render(
      <MemoryRouter>
        <FacilityForm
          facility={facility}
          deviceTypes={devices}
          saveFacility={saveFacility}
        />
      </MemoryRouter>
    ),
  });

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
      renderWithUser();
      expect(screen.getByText("Back to all facilities")).toBeInTheDocument();
      expect(screen.getByText("Back to all facilities")).toHaveAttribute(
        "href",
        "/settings/facilities"
      );
    });

    it("submits a valid form", async () => {
      const { user } = renderWithUser();
      await user.type(
        screen.getByLabelText("Testing facility name", { exact: false }),
        "Bar Facility"
      );
      await clickSaveButton(user);
      await validateAddress(user, saveFacility);
    });

    it("provides validation feedback during form completion", async () => {
      const { user } = renderWithUser();
      const facilityNameInput = screen.getByLabelText("Testing facility name", {
        exact: false,
      });
      await user.clear(facilityNameInput);
      await clickSaveButton(user);
      const nameWarning = await screen.findByText("Facility name is required");
      expect(nameWarning).toBeInTheDocument();
      await user.type(facilityNameInput, "Test facility A");

      const facilityStreetAddressInput = screen.getAllByLabelText(
        "Street address 1",
        {
          exact: false,
        }
      )[0];
      await user.clear(facilityStreetAddressInput);
      await clickSaveButton(user);
      const streetAddressWarning = await screen.findByText(
        "Facility street is required"
      );
      expect(streetAddressWarning).toBeInTheDocument();

      await user.type(facilityStreetAddressInput, "123 Main Street");

      const facilityZipCodeInput = screen.getAllByLabelText("ZIP code", {
        exact: false,
      })[0];
      await user.clear(facilityZipCodeInput);
      await clickSaveButton(user);
      const facilityZipCodeWarning = await screen.findByText(
        "Facility ZIP code is required"
      );
      expect(facilityZipCodeWarning).toBeInTheDocument();
    });

    it("prevents submit for invalid form", async () => {
      const { user } = renderWithUser();
      const saveButton = await screen.getAllByText("Save changes")[0];
      const facilityNameInput = screen.getByLabelText("Testing facility name", {
        exact: false,
      });
      await user.clear(facilityNameInput);
      await user.click(saveButton);
      await waitFor(async () => expect(saveButton).toBeEnabled());
      expect(saveFacility).toBeCalledTimes(0);
    });

    it("validates optional email field", async () => {
      const { user } = renderWithUser();
      const emailInput = screen.getByLabelText("Email", {
        exact: false,
      });
      await user.type(emailInput, "123-456-7890");
      await clickSaveButton(user);

      expect(
        await screen.findByText("Email is incorrectly formatted", {
          exact: false,
        })
      ).toBeInTheDocument();

      await clickSaveButton(user);
      expect(saveFacility).toBeCalledTimes(0);

      await user.type(emailInput, "foofacility@example.com");
      await clickSaveButton(user);
      await validateAddress(user, saveFacility);
    });

    it("only accepts live jurisdictions", async () => {
      const { user } = renderWithUser();
      const stateDropdownElement = screen.getByTestId(
        "facility-state-dropdown"
      );
      await user.selectOptions(stateDropdownElement, "PW");
      await clickSaveButton(user);
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
      const { user } = renderWithUser();
      const saveButton = screen.getAllByText("Save changes")[0];

      await user.clear(
        screen.getByLabelText("Testing facility name", { exact: false })
      );
      await user.click(saveButton);
      await waitFor(() =>
        expect(
          screen.getByLabelText("Testing facility name", { exact: false })
        ).toHaveFocus()
      );
    });
  });

  describe("CLIA number validation", () => {
    const expectedError =
      "CLIA numbers must be 10 characters (##D#######), or a special temporary number from CA, IL, VT, WA, WY, or the Department of Defense";

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
        const { user } = renderWithUser();

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        await user.type(cliaInput, "12F3456789");
        await clickSaveButton(user);

        expect(
          await screen.findByText(expectedError, {
            exact: false,
          })
        ).toBeInTheDocument();

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
        const { user } = renderWithUser();

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });
        await user.type(cliaInput, "invalid-clia-number");
        await user.tab();

        const saveButton = await screen.getAllByText("Save changes")[0];
        await user.click(saveButton);
        await validateAddress(user, saveFacility);
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

        const { user } = renderWithUser(washingtonFacility);

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        await user.clear(cliaInput);
        await user.type(cliaInput, "12Z3456789");
        await user.tab();

        const saveButton = await screen.getAllByText("Save changes")[0];
        await user.click(saveButton);
        await validateAddress(user, saveFacility);
        expect(saveFacility).toBeCalledTimes(1);
      });

      it("doesn't allow a Z-CLIA for a non (WA, NM, VT, IL, WY) state", async () => {
        const marylandFacility: Facility = validFacility;
        marylandFacility.state = "MD";
        const { user } = renderWithUser(marylandFacility);

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        await user.clear(cliaInput);
        await user.type(cliaInput, "12Z3456789");
        await clickSaveButton(user);

        expect(
          await screen.findByText(expectedError, {
            exact: false,
          })
        ).toBeInTheDocument();

        expect(saveFacility).toBeCalledTimes(0);
      });

      it("allows alphanumeric characters for California", async () => {
        const californiaFacility: Facility = validFacility;
        californiaFacility.state = "CA";

        const { user } = renderWithUser(californiaFacility);

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        await user.clear(cliaInput);
        await user.type(cliaInput, "CPDH000006");
        await user.tab();

        const saveButton = await screen.getAllByText("Save changes")[0];
        await user.click(saveButton);
        await validateAddress(user, saveFacility);
        expect(saveFacility).toBeCalledTimes(1);
      });

      it("allows 47ZXXXXXXX pattern for VT", async () => {
        const vermontFacility: Facility = validFacility;
        vermontFacility.state = "VT";

        const { user } = renderWithUser(vermontFacility);

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        await user.clear(cliaInput);
        await user.type(cliaInput, "47Z1234567");
        await user.tab();

        const saveButton = await screen.getAllByText("Save changes")[0];
        await user.click(saveButton);
        await validateAddress(user, saveFacility);
        expect(saveFacility).toBeCalledTimes(1);
      });

      it("allows 32ZXXXXXXX pattern for NM", async () => {
        const newMexicoFacility: Facility = validFacility;
        newMexicoFacility.state = "NM";

        const { user } = renderWithUser(newMexicoFacility);

        const cliaInput = screen.getByLabelText("CLIA number", {
          exact: false,
        });

        await user.clear(cliaInput);
        await user.type(cliaInput, "32Z1234567");
        await user.tab();

        const saveButton = await screen.getAllByText("Save changes")[0];
        await user.click(saveButton);
        await validateAddress(user, saveFacility);
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
        const { user } = renderWithUser();

        const npiInput = screen.getByLabelText("NPI", {
          exact: false,
        });

        await user.clear(npiInput);
        await clickSaveButton(user);

        const expectedError =
          "NPI should be a 10-digit numerical value (##########)";

        // The mock function was called at least once
        expect(spy.mock.calls.length).toBeGreaterThan(0);
        expect(
          await screen.findByText(expectedError, {
            exact: false,
          })
        ).toBeInTheDocument();

        await clickSaveButton(user);
        expect(saveFacility).toBeCalledTimes(0);
      });

      it("requires a valid NPI (digits only)", async () => {
        const { user } = renderWithUser();

        const npiInput = screen.getByLabelText("NPI", {
          exact: false,
        });

        await user.clear(npiInput);
        await user.type(npiInput, "Facility name");
        await clickSaveButton(user);

        const expectedError =
          "NPI should be a 10-digit numerical value (##########)";
        // The mock function was called at least once
        expect(spy.mock.calls.length).toBeGreaterThan(0);
        expect(
          await screen.findByText(expectedError, {
            exact: false,
          })
        ).toBeInTheDocument();

        expect(saveFacility).toBeCalledTimes(0);
      });

      it("suggests address validation for ordering provider when address provided", async () => {
        const { user } = renderWithUser();

        const opStreetInput = screen.getAllByLabelText("Street address 1", {
          exact: false,
        })[1];
        await user.type(opStreetInput, "432 Green Street");
        const opCityInput = screen.getAllByLabelText("City", {
          exact: false,
        })[1];
        await user.type(opCityInput, "Englewood");
        const stateDropdownElement = screen.getByTestId("op-state-dropdown");
        await user.selectOptions(stateDropdownElement, "NJ");
        const opZIPInput = screen.getAllByLabelText("ZIP code", {
          exact: false,
        })[1];
        await user.type(opZIPInput, "07026");
        await clickSaveButton(user);
        await screen.findByText("Address validation");
        expect(
          screen.getByText(
            "Please select an option for ordering provider address to continue:"
          )
        ).toBeInTheDocument();
        expect(screen.getByText("432 Green Street")).toBeInTheDocument();
        expect(screen.getByText("Englewood, NJ 07026")).toBeInTheDocument();
        expect(suggestionIsCloseEnoughSpy).toBeCalledTimes(2);
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
        const { user } = renderWithUser();

        const npiInput = screen.getByLabelText("NPI", {
          exact: false,
        });
        await user.clear(npiInput);
        await user.tab();

        // The spy function was called at least once
        expect(spy.mock.calls.length).toBeGreaterThan(0);

        await clickSaveButton(user);
        await validateAddress(user, saveFacility);
        expect(saveFacility).toBeCalledTimes(1);
      });
    });
  });

  describe("Device validation", () => {
    it("warns about missing device selection", async () => {
      const { user } = renderWithUser();
      await deleteAllDevices(user);

      await screen.findByText("There are currently no devices", {
        exact: false,
      });

      await clickSaveButton(user);

      await screen.findByText("There must be at least one device", {
        exact: false,
      });
    });

    it("resolves the error when a device is selected", async () => {
      const { user } = renderWithUser();
      await deleteAllDevices(user);

      await screen.findByText("There are currently no devices", {
        exact: false,
      });

      await clickSaveButton(user);

      await screen.findByText("There must be at least one device", {
        exact: false,
      });

      // Select Device
      const deviceInput = screen.getByLabelText(
        "Search for a device to add it"
      );
      await user.click(deviceInput);

      await user.click(screen.getByLabelText("Select Manufacturer 1 Device 1"));

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
      const { user } = renderWithUser(facility);
      const facilityName = screen.getByLabelText("Testing facility name", {
        exact: false,
      });
      await user.clear(facilityName);
      await user.type(facilityName, "La Croix Facility");
      await clickSaveButton(user);
      await validateAddress(user, saveFacility, "suggested address");
      expect(getIsValidZipForStateSpy).toBeCalledTimes(1);
      expect(saveFacility).toBeCalledWith({
        facility: {
          name: "La Croix Facility",
          cliaNumber: "12D4567890",
          phone: "(202) 395-3080",
          email: null,
          ...addresses[0].good,
        },
        orderingProvider: {
          firstName: "Frank",
          lastName: "Grimes",
          NPI: "1231231231",
          middleName: null,
          suffix: null,
          phone: "(201) 559-2381",
          ...addresses[1].good,
        },
        devices: ["device-1", "device-2"],
      });
    });

    it("blocks submission of facility on invalid ZIP code for state", async () => {
      getIsValidZipForStateSpy.mockReturnValueOnce(false);

      render(
        <>
          <MemoryRouter>
            <FacilityForm
              facility={validFacility}
              deviceTypes={devices}
              saveFacility={saveFacility}
            />
          </MemoryRouter>
          <SRToastContainer />
        </>
      );
      const user = userEvent.setup();

      const facilityName = screen.getByLabelText("Testing facility name", {
        exact: false,
      });
      await user.clear(facilityName);
      await user.type(facilityName, "La Croix Facility");
      await clickSaveButton(user);

      await waitFor(() => expect(getIsValidZipForStateSpy).toBeCalledTimes(1));
      // Does not perform further address validation on invalid ZIP code for state
      expect(getBestSuggestionSpy).not.toHaveBeenCalled();
      // Toast alert appears
      expect(await screen.findByText(/Invalid ZIP code for this state/i));
      getIsValidZipForStateSpy.mockRestore();
    });
  });
});

async function deleteAllDevices(user: UserEvent) {
  const pillContainer = screen.getByTestId("pill-container");
  const deleteButtons = within(pillContainer).getAllByRole("button");
  deleteButtons.forEach((button) => user.click(button));
}

const clickSaveButton = async (user: UserEvent) => {
  const saveButton = await screen.getAllByText("Save changes")[0];
  await user.click(saveButton);
};

async function validateAddress(
  user: UserEvent,
  saveFacility: (facility: Facility) => void,
  selection: "as entered" | "suggested address" = "as entered"
) {
  await screen.findByText("Address validation");
  const radios = screen.getAllByLabelText(selection, { exact: false });
  await Promise.all(radios.map((r) => user.click(r)));
  const button = screen.getAllByText("Save changes")[2];
  expect(button).toBeEnabled();
  await user.click(button);
  expect(saveFacility).toBeCalledTimes(1);
}
