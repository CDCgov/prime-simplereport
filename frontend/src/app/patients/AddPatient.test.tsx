import {
  render,
  screen,
  within,
  waitForElementToBeRemoved,
  waitFor,
} from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { ToastContainer } from "react-toastify";

import AddPatient, { ADD_PATIENT, PATIENT_EXISTS } from "./AddPatient";

const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";
const mockStore = configureStore([]);
const store = mockStore({
  facilities: [{ id: mockFacilityID, name: "123" }],
  organization: { name: "Test Organization" },
});

const RouterWithFacility: React.FC = ({ children }) => (
  <MemoryRouter initialEntries={[`/add-patient?facility=${mockFacilityID}`]}>
    <Routes>{children}</Routes>
  </MemoryRouter>
);

jest.mock("../utils/smartyStreets", () => ({
  getBestSuggestion: jest.fn(),
  suggestionIsCloseEnough: () => false,
}));

const fillOutForm = (
  inputs: { [label: string]: string },
  dropdowns: { [label: string]: string },
  inputGroups: {
    [legend: string]: { label: string; value: string; exact?: boolean };
  }
) => {
  Object.entries(inputs).forEach(([label, value]) => {
    userEvent.type(
      screen.getByLabelText(label, {
        exact: false,
      }),
      value
    );
  });
  Object.entries(dropdowns).forEach(([label, value]) => {
    userEvent.selectOptions(
      screen.getByLabelText(label, {
        exact: false,
      }),
      [value]
    );
  });
  Object.entries(inputGroups).forEach(([legend, { label, exact }]) => {
    const fieldset = screen
      .getByText(legend, {
        exact: true,
      })
      .closest("fieldset");
    if (fieldset === null) {
      throw Error(`Unable to corresponding fieldset for ${legend}`);
    }
    userEvent.click(
      within(fieldset).getByLabelText(label, {
        exact: exact || false,
      })
    );
  });
};

describe("AddPatient", () => {
  describe("No facility selected", () => {
    beforeEach(() => {
      render(
        <Provider store={store}>
          <MockedProvider mocks={[]} addTypename={false}>
            <MemoryRouter>
              <Routes>
                <Route path="/" element={<AddPatient />} />
              </Routes>
            </MemoryRouter>
          </MockedProvider>
        </Provider>
      );
    });
    it("does not show the form title", () => {
      expect(
        screen.queryByText("Add new person", {
          exact: false,
        })
      ).not.toBeInTheDocument();
    });
    it("shows a 'No facility selected' message", async () => {
      expect(
        screen.getByText("No facility selected", {
          exact: false,
        })
      ).toBeInTheDocument();
    });
  });

  describe("happy path", () => {
    beforeEach(async () => {
      const mocks = [
        {
          request: {
            query: ADD_PATIENT,
            variables: {
              firstName: "Alice",
              middleName: null,
              lastName: "Hamilton",
              lookupId: null,
              birthDate: "1970-09-22",
              street: "25 Shattuck St",
              streetTwo: null,
              city: "Boston",
              state: "MA",
              zipCode: "02115",
              country: "USA",
              telephone: null,
              phoneNumbers: [
                {
                  type: "MOBILE",
                  number: "617-432-1000",
                },
              ],
              role: null,
              emails: ["foo@bar.org"],
              county: "",
              race: "other",
              ethnicity: "refused",
              gender: "female",
              facilityId: mockFacilityID,
              preferredLanguage: null,
              testResultDelivery: "SMS",
            },
          },
          result: {
            data: {
              addPatient: {
                internalId: "153f661f-b6ea-4711-b9ab-487b95198cce",
                facility: {
                  id: "facility-id-001",
                },
              },
            },
          },
        },
        {
          request: {
            query: ADD_PATIENT,
            variables: {
              firstName: "Alice",
              middleName: null,
              lastName: "Hamilton",
              lookupId: "student-123",
              birthDate: "1970-09-22",
              street: "25 Shattuck St",
              streetTwo: null,
              city: "Boston",
              state: "MA",
              zipCode: "02115",
              country: "USA",
              telephone: null,
              phoneNumbers: [
                {
                  type: "MOBILE",
                  number: "617-432-1000",
                },
              ],
              role: "STUDENT",
              emails: [],
              county: "",
              race: "other",
              ethnicity: "refused",
              gender: "female",
              facilityId: mockFacilityID,
              preferredLanguage: null,
              testResultDelivery: null,
            },
          },
          result: {
            data: {
              internalId: "153f661f-b6ea-4711-b9ab-487b95198cce",
              facility: {
                id: "facility-id-001",
              },
            },
          },
        },
      ];

      const Queue = () => {
        const location = useLocation();
        return <p>Testing Queue! {location.search}</p>;
      };

      render(
        <>
          <Provider store={store}>
            <MockedProvider mocks={mocks} addTypename={false}>
              <RouterWithFacility>
                <Route element={<AddPatient />} path={"/add-patient"} />
                <Route path={"/patients"} element={<p>Patients!</p>} />
                <Route path={"/queue"} element={<Queue />} />
              </RouterWithFacility>
            </MockedProvider>
          </Provider>
          <ToastContainer
            autoClose={5000}
            closeButton={false}
            limit={2}
            position="bottom-center"
            hideProgressBar={true}
          />
        </>
      );
    });
    it("shows the form title", async () => {
      expect(
        (await screen.findAllByText("Add new person", { exact: false }))[0]
      ).toBeInTheDocument();
    });

    describe("Choosing a country", () => {
      it("should show the state and zip code inputs for USA", async () => {
        userEvent.selectOptions(
          screen.getByLabelText("Country", { exact: false }),
          "USA"
        );
        expect(await screen.findByText("State")).toBeInTheDocument();
        expect(await screen.findByText("ZIP code")).toBeInTheDocument();
      });
      it("should show the state and zip code inputs for Canada", async () => {
        userEvent.selectOptions(
          screen.getByLabelText("Country", { exact: false }),
          "CAN"
        );
        expect(await screen.findByText("State")).toBeInTheDocument();
        expect(await screen.findByText("ZIP code")).toBeInTheDocument();
      });
      it("should show different states for Canada", async () => {
        userEvent.selectOptions(
          screen.getByLabelText("Country", { exact: false }),
          "CAN"
        );

        let stateInput: HTMLSelectElement;
        stateInput = screen.getByLabelText("State", {
          exact: false,
        }) as HTMLSelectElement;

        userEvent.selectOptions(stateInput, "QC");
        expect(stateInput.value).toBe("QC");
      });
      it("should hide the state and zip code inputs for non-US countries", async () => {
        userEvent.selectOptions(
          screen.getByLabelText("Country", { exact: false }),
          "MEX"
        );
        expect(screen.queryByText("State")).not.toBeInTheDocument();
        expect(screen.queryByText("ZIP code")).not.toBeInTheDocument();
      });
    });

    describe("All required fields entered and submitting address verification", () => {
      it("redirects to the person tab", async () => {
        fillOutForm(
          {
            "First Name": "Alice",
            "Last Name": "Hamilton",
            "Date of birth": "1970-09-22",
            "Primary phone number": "617-432-1000",
            "Email address": "foo@bar.org",
            "Street address 1": "25 Shattuck St",
            City: "Boston",

            "ZIP code": "02115",
          },
          { Facility: mockFacilityID, State: "MA", Country: "USA" },
          {
            "Phone type": {
              label: "Mobile",
              value: "MOBILE",
              exact: true,
            },
            "Would you like to receive your results via text message?": {
              label: "Yes",
              value: "SMS",
              exact: false,
            },
            Race: {
              label: "Other",
              value: "other",
              exact: true,
            },
            "Are you Hispanic or Latino?": {
              label: "Prefer not to answer",
              value: "refused",
              exact: true,
            },
            "Sex assigned at birth": {
              label: "Female",
              value: "female",
              exact: true,
            },
          }
        );
        userEvent.click(
          screen.queryAllByText("Save Changes", {
            exact: false,
          })[0]
        );
        expect(
          await screen.findByText("Address validation", {
            exact: false,
          })
        ).toBeInTheDocument();
        const modal = screen.getByRole("dialog", {
          exact: false,
        });

        userEvent.click(
          within(modal).getByLabelText("Use address as entered", {
            exact: false,
          })
        );
        userEvent.click(
          within(modal).getByText("Save changes", {
            exact: false,
          })
        );
        await waitForElementToBeRemoved(() =>
          screen.queryAllByText("Saving...")
        );
        expect(screen.getByText("Patients!")).toBeInTheDocument();
      });

      it("requires race field to be populated", async () => {
        fillOutForm(
          {
            "First Name": "Alice",
            "Last Name": "Hamilton",
            "Date of birth": "1970-09-22",
            "Primary phone number": "617-432-1000",
            "Email address": "foo@bar.org",
            "Street address 1": "25 Shattuck St",
            City: "Boston",

            "ZIP code": "02115",
          },
          { Facility: mockFacilityID, State: "MA", Country: "USA" },
          {
            "Phone type": {
              label: "Mobile",
              value: "MOBILE",
              exact: true,
            },
            "Would you like to receive your results via text message?": {
              label: "Yes",
              value: "SMS",
              exact: false,
            },
            "Sex assigned at birth": {
              label: "Female",
              value: "female",
              exact: true,
            },
          }
        );
        userEvent.click(
          screen.queryAllByText("Save Changes", {
            exact: false,
          })[0]
        );

        expect(
          await screen.findByText("Race is required", { exact: false })
        ).toBeInTheDocument();
      });
    });

    describe("facility select input", () => {
      let facilityInput: HTMLSelectElement;
      beforeEach(() => {
        facilityInput = screen.getByLabelText("Facility", {
          exact: false,
        }) as HTMLSelectElement;
      });
      it("is present in the form", () => {
        expect(facilityInput).toBeInTheDocument();
      });
      it("defaults to no selection", () => {
        expect(facilityInput.value).toBe("");
      });
      it("updates its selection on change", async () => {
        userEvent.selectOptions(facilityInput, [mockFacilityID]);
        expect(facilityInput.value).toBe(mockFacilityID);
      });
    });

    describe("With student ID", () => {
      it("allows student ID to be entered", async () => {
        userEvent.selectOptions(screen.getByLabelText("Role"), "STUDENT");
        expect(await screen.findByText("Student ID")).toBeInTheDocument();
      });
    });

    describe("saving changes and starting a test", () => {
      it("redirects to the queue with a patient id and selected facility id", async () => {
        fillOutForm(
          {
            "First Name": "Alice",
            "Last Name": "Hamilton",
            "Date of birth": "1970-09-22",
            "Primary phone number": "617-432-1000",
            "Email address": "foo@bar.org",
            "Street address 1": "25 Shattuck St",
            City: "Boston",
            "ZIP code": "02115",
          },
          { Facility: mockFacilityID, State: "MA", Country: "USA" },
          {
            "Phone type": {
              label: "Mobile",
              value: "MOBILE",
              exact: true,
            },
            "Would you like to receive your results via text message?": {
              label: "Yes",
              value: "SMS",
              exact: false,
            },
            Race: {
              label: "Other",
              value: "other",
              exact: true,
            },
            "Are you Hispanic or Latino?": {
              label: "Prefer not to answer",
              value: "refused",
              exact: true,
            },
            "Sex assigned at birth": {
              label: "Female",
              value: "female",
              exact: true,
            },
          }
        );
        userEvent.click(
          screen.queryAllByText("Save and start test", {
            exact: false,
          })[0]
        );
        expect(
          await screen.findByText("Address validation", {
            exact: false,
          })
        ).toBeInTheDocument();

        const modal = screen.getByRole("dialog", {
          exact: false,
        });

        userEvent.click(
          within(modal).getByLabelText("Use address as entered", {
            exact: false,
          })
        );
        userEvent.click(
          within(modal).getByText("Save changes", {
            exact: false,
          })
        );
        await waitForElementToBeRemoved(() =>
          screen.queryAllByText("Saving...")
        );
        expect(
          screen.getByText("Testing Queue!", { exact: false })
        ).toBeInTheDocument();
        expect(
          screen.getByText("facility-id-001", { exact: false })
        ).toBeInTheDocument();
      });
    });
  });

  describe("when attempting to create an existing patient ", () => {
    it("does not open modal if no patient with matching data exists", async () => {
      let patientExistsMock = jest.fn();
      const mocks = [
        {
          request: {
            query: PATIENT_EXISTS,
            variables: {
              firstName: "Alice",
              lastName: "Hamilton",
              birthDate: "1970-09-22",
              facilityId: mockFacilityID,
            },
          },
          result: () => {
            patientExistsMock();
            return {
              data: {
                patientExistsWithoutZip: false,
              },
            };
          },
        },
      ];

      render(
        <Provider store={store}>
          <MockedProvider mocks={mocks} addTypename={false}>
            <RouterWithFacility>
              <Route element={<AddPatient />} path={"/add-patient/"} />
              <Route path={"/patients"} element={<p>Patients!</p>} />
            </RouterWithFacility>
          </MockedProvider>
        </Provider>
      );

      fillOutForm(
        {
          "First Name": "Alice",
          "Last Name": "Hamilton",
        },
        { Facility: mockFacilityID },
        {}
      );

      // The duplicate patient check is triggered on-blur from one of the identifying data fields
      userEvent.type(
        screen.getByLabelText("Date of birth", { exact: false }),
        "1970-09-22"
      );
      userEvent.tab();

      await waitFor(() => {
        expect(patientExistsMock).toHaveBeenCalledTimes(1);
      });

      expect(
        screen.queryByText("This patient is already registered", {
          exact: false,
        })
      ).not.toBeInTheDocument();
    });

    it("displays modal when all identifying data fields have been entered with an existing patient's data", async () => {
      const mocks = [
        {
          request: {
            query: PATIENT_EXISTS,
            variables: {
              firstName: "Alice",
              lastName: "Hamilton",
              birthDate: "1970-09-22",
              facilityId: mockFacilityID,
            },
          },
          result: {
            data: {
              patientExistsWithoutZip: true,
            },
          },
        },
      ];

      render(
        <Provider store={store}>
          <MockedProvider mocks={mocks} addTypename={false}>
            <RouterWithFacility>
              <Route element={<AddPatient />} path={"/add-patient/"} />
              <Route path={"/patients"} element={<p>Patients!</p>} />
            </RouterWithFacility>
          </MockedProvider>
        </Provider>
      );

      fillOutForm(
        {
          "First Name": "Alice",
          "Last Name": "Hamilton",
        },
        { Facility: mockFacilityID },
        {}
      );

      // The duplicate patient check is triggered on-blur from one of the identifying data fields
      userEvent.type(
        screen.getByLabelText("Date of birth", { exact: false }),
        "1970-09-22"
      );
      userEvent.tab();

      expect(
        await screen.findByText("This patient is already registered", {
          exact: false,
        })
      ).toBeInTheDocument();
    });
  });
});
