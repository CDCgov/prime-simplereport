import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route } from "react-router";

import AddPatient, { ADD_PATIENT, PATIENT_EXISTS } from "./AddPatient";

const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";
const mockStore = configureStore([]);
const store = mockStore({
  facilities: [{ id: mockFacilityID, name: "123" }],
  organization: { name: "Test Organization" },
});

const RouterWithFacility: React.FC = ({ children }) => (
  <MemoryRouter initialEntries={[`/add-patient?facility=${mockFacilityID}`]}>
    {children}
  </MemoryRouter>
);

jest.mock("../utils/smartyStreets", () => ({
  getBestSuggestion: jest.fn(),
  suggestionIsCloseEnough: () => false,
}));

const fillOutForm = (
  inputs: { [label: string]: string },
  inputGroups: {
    [legend: string]: { label: string; value: string; exact?: boolean };
  }
) => {
  Object.entries(inputs).forEach(([label, value]) => {
    fireEvent.change(
      screen.getByLabelText(label, {
        exact: false,
      }),
      {
        target: { value },
      }
    );
  });
  Object.entries(inputGroups).forEach(([legend, { label, value, exact }]) => {
    const fieldset = screen
      .getByText(legend, {
        exact: false,
      })
      .closest("fieldset");
    if (fieldset === null) {
      throw Error(`Unable to corresponding fieldset for ${legend}`);
    }
    fireEvent.click(
      within(fieldset).getByLabelText(label, {
        exact: exact || false,
      }),
      {
        target: { value },
      }
    );
  });
};

describe("AddPatient", () => {
  afterEach(cleanup);
  describe("No facility selected", () => {
    beforeEach(() => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <MockedProvider mocks={[]} addTypename={false}>
              <AddPatient />
            </MockedProvider>
          </Provider>
        </MemoryRouter>
      );
    });
    it("does not show the form title", () => {
      expect(
        screen.queryByText("Add new person", {
          exact: false,
        })
      ).toBeNull();
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
    beforeEach(() => {
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
              email: null,
              emails: ["foo@bar.org"],
              county: "",
              race: null,
              ethnicity: null,
              gender: null,
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
              email: null,
              emails: [],
              county: "",
              race: null,
              ethnicity: null,
              gender: null,
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

      render(
        <Provider store={store}>
          <MockedProvider mocks={mocks} addTypename={false}>
            <RouterWithFacility>
              <Route component={AddPatient} path={"/add-patient/"} />
              <Route path={"/patients"} render={() => <p>Patients!</p>} />
              <Route
                path={"/queue"}
                render={(p) => <p>Testing Queue! {p.location.search}</p>}
              />
            </RouterWithFacility>
          </MockedProvider>
        </Provider>
      );
    });
    it("shows the form title", async () => {
      expect(
        await screen.queryAllByText("Add new person", { exact: false })[0]
      ).toBeInTheDocument();
    });

    describe("Choosing a country", () => {
      it("should show the state and zip code inputs for USA", async () => {
        fillOutForm(
          {
            "First Name": "Alice",
            "Last Name": "Hamilton",
            Facility: mockFacilityID,
            "Date of birth": "1970-09-22",
            "Primary phone number": "617-432-1000",
            "Email address": "foo@bar.org",
            Country: "USA",
            "Street address 1": "25 Shattuck St",
            City: "Vancouver",
          },
          {
            "Phone type": {
              label: "Mobile",
              value: "MOBILE",
              exact: true,
            },
            "Would you like to receive your results via text message": {
              label: "Yes",
              value: "SMS",
              exact: false,
            },
          }
        );
        expect(await screen.queryByText("State")).toBeInTheDocument();
        expect(await screen.queryByText("ZIP code")).toBeInTheDocument();
      });
      it("should hide the state and zip code inputs for non-US countries", async () => {
        fillOutForm(
          {
            "First Name": "Alice",
            "Last Name": "Hamilton",
            Facility: mockFacilityID,
            "Date of birth": "1970-09-22",
            "Primary phone number": "617-432-1000",
            "Email address": "foo@bar.org",
            Country: "CAN",
            "Street address 1": "25 Shattuck St",
            City: "Vancouver",
          },
          {
            "Phone type": {
              label: "Mobile",
              value: "MOBILE",
              exact: true,
            },
            "Would you like to receive your results via text message": {
              label: "Yes",
              value: "SMS",
              exact: false,
            },
          }
        );
        expect(await screen.queryByText("State")).not.toBeInTheDocument();
        expect(await screen.queryByText("ZIP code")).not.toBeInTheDocument();
      });
    });

    describe("All required fields entered", () => {
      beforeEach(async () => {
        fillOutForm(
          {
            "First Name": "Alice",
            "Last Name": "Hamilton",
            Facility: mockFacilityID,
            "Date of birth": "1970-09-22",
            "Primary phone number": "617-432-1000",
            "Email address": "foo@bar.org",
            "Street address 1": "25 Shattuck St",
            City: "Boston",
            State: "MA",
            "ZIP code": "02115",
          },
          {
            "Phone type": {
              label: "Mobile",
              value: "MOBILE",
              exact: true,
            },
            "Would you like to receive your results via text message": {
              label: "Yes",
              value: "SMS",
              exact: false,
            },
          }
        );
        await act(async () => {
          fireEvent.click(
            screen.queryAllByText("Save Changes", {
              exact: false,
            })[0]
          );
        });
      });
      it("show the address validation modal", async () => {
        await screen.findByText(`Address Validation`, {
          exact: false,
        });
      });
      describe("Submitting Address Verification", () => {
        beforeEach(async () => {
          const modal = screen.getByRole("dialog", {
            exact: false,
          });

          fireEvent.click(
            within(modal).getByLabelText("Use address as entered", {
              exact: false,
            }),
            {
              target: { value: "userAddress" },
            }
          );
          await act(async () => {
            fireEvent.click(
              within(modal).getByText("Save changes", {
                exact: false,
              })
            );
          });
        });
        it("redirects to the person tab", () => {
          expect(screen.getByText("Patients!")).toBeInTheDocument();
        });
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
        fireEvent.change(facilityInput, {
          target: { value: mockFacilityID },
        });
        expect(facilityInput.value).toBe(mockFacilityID);
      });
    });

    describe("With student ID", () => {
      it("allows student ID to be entered", async () => {
        fillOutForm(
          {
            "First Name": "Alice",
            "Last Name": "Hamilton",
            Facility: mockFacilityID,
            "Date of birth": "1970-09-22",
            "Primary phone number": "617-432-1000",
            "Street address 1": "25 Shattuck St",
            City: "Boston",
            State: "MA",
            "ZIP code": "02115",
          },
          {
            "Phone type": {
              label: "Mobile",
              value: "MOBILE",
              exact: true,
            },
            "Are you a resident in a congregate living setting": {
              label: "No",
              value: "No",
              exact: true,
            },
            "Are you a health care worker": {
              label: "Yes",
              value: "Yes",
              exact: true,
            },
          }
        );

        fireEvent.change(screen.getByLabelText("Role"), {
          target: { value: "STUDENT" },
        });
        expect(await screen.findByText("Student ID")).toBeInTheDocument();
      });
    });

    describe("saving changes and starting a test", () => {
      beforeEach(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        fillOutForm(
          {
            "First Name": "Alice",
            "Last Name": "Hamilton",
            Facility: mockFacilityID,
            "Date of birth": "1970-09-22",
            "Primary phone number": "617-432-1000",
            "Email address": "foo@bar.org",
            "Street address 1": "25 Shattuck St",
            Country: "USA",
            City: "Boston",
            State: "MA",
            "ZIP code": "02115",
          },
          {
            "Phone type": {
              label: "Mobile",
              value: "MOBILE",
              exact: true,
            },
            "Would you like to receive your results via text message": {
              label: "Yes",
              value: "SMS",
              exact: false,
            },
          }
        );
        await act(async () => {
          fireEvent.click(
            screen.queryAllByText("Save and start test", {
              exact: false,
            })[0]
          );
        });

        const modal = screen.getByRole("dialog", {
          exact: false,
        });

        fireEvent.click(
          within(modal).getByLabelText("Use address as entered", {
            exact: false,
          }),
          {
            target: { value: "userAddress" },
          }
        );
        await act(async () => {
          fireEvent.click(
            within(modal).getByText("Save changes", {
              exact: false,
            })
          );
        });
      });

      it("redirects to the queue with a patient id and selected facility id", () => {
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
    let patientExistsMockWasCalled = false;

    it("performs GraphQL query when all identifying data fields have been entered", async () => {
      const mocks = [
        {
          request: {
            query: PATIENT_EXISTS,
            variables: {
              firstName: "Alice",
              lastName: "Hamilton",
              birthDate: "1970-09-22",
              zipCode: "02115",
              facilityId: mockFacilityID,
            },
          },
          result: () => {
            patientExistsMockWasCalled = true;

            return {
              data: {
                patientExists: false,
              },
            };
          },
        },
      ];

      render(
        <Provider store={store}>
          <MockedProvider mocks={mocks} addTypename={false}>
            <RouterWithFacility>
              <Route component={AddPatient} path={"/add-patient/"} />
              <Route path={"/patients"} render={() => <p>Patients!</p>} />
            </RouterWithFacility>
          </MockedProvider>
        </Provider>
      );

      fillOutForm(
        {
          "First Name": "Alice",
          "Last Name": "Hamilton",
          Facility: mockFacilityID,
          "Date of birth": "1970-09-22",
          "ZIP code": "02115",
        },
        {}
      );

      const zip = await screen.findByLabelText("ZIP code", {
        exact: false,
      });

      fireEvent.blur(zip);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(patientExistsMockWasCalled).toBe(true);
    });

    it("does not open modal if no patient with matching data exists", async () => {
      const mocks = [
        {
          request: {
            query: PATIENT_EXISTS,
            variables: {
              firstName: "Alice",
              lastName: "Hamilton",
              birthDate: "1970-09-22",
              zipCode: "02115",
              facilityId: mockFacilityID,
            },
          },
          result: {
            data: {
              patientExists: false,
            },
          },
        },
      ];

      render(
        <Provider store={store}>
          <MockedProvider mocks={mocks} addTypename={false}>
            <RouterWithFacility>
              <Route component={AddPatient} path={"/add-patient/"} />
              <Route path={"/patients"} render={() => <p>Patients!</p>} />
            </RouterWithFacility>
          </MockedProvider>
        </Provider>
      );

      fillOutForm(
        {
          "First Name": "Alice",
          "Last Name": "Hamilton",
          Facility: mockFacilityID,
          "Date of birth": "1970-09-22",
          "ZIP code": "02115",
        },
        {}
      );

      const zip = await screen.findByLabelText("ZIP code", {
        exact: false,
      });

      fireEvent.blur(zip);

      expect(
        screen.queryByText("You already have a profile at", {
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
              zipCode: "02115",
              facilityId: mockFacilityID,
            },
          },
          result: {
            data: {
              patientExists: true,
            },
          },
        },
      ];

      render(
        <Provider store={store}>
          <MockedProvider mocks={mocks} addTypename={false}>
            <RouterWithFacility>
              <Route component={AddPatient} path={"/add-patient/"} />
              <Route path={"/patients"} render={() => <p>Patients!</p>} />
            </RouterWithFacility>
          </MockedProvider>
        </Provider>
      );

      fillOutForm(
        {
          "First Name": "Alice",
          "Last Name": "Hamilton",
          Facility: mockFacilityID,
          "Date of birth": "1970-09-22",
          "ZIP code": "02115",
        },
        {}
      );

      // The duplicate patient check is triggered on-blur from one of the identifying data fields
      const zip = await screen.findByLabelText("ZIP code", {
        exact: false,
      });

      act(() => {
        fireEvent.change(zip, {
          target: {
            value: "02115",
          },
        });
      });

      fireEvent.blur(zip);

      expect(
        await screen.findByText("This patient is already registered", {
          exact: false,
        })
      ).toBeInTheDocument();
    });
  });
});
