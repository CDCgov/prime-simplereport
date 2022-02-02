import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import EditPatient, { GET_PATIENT } from "./EditPatient";
import EditPatientContainer from "./EditPatientContainer";

jest.mock("@trussworks/react-uswds", () => ({
  ComboBox: () => <></>,
}));
const mockStore = configureStore([]);

describe("EditPatient", () => {
  const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";
  const mockPatientID = "555e8a40-0f95-458e-a038-6b500a0fc2ad";
  const store = mockStore({
    facilities: [{ id: mockFacilityID, name: "123" }],
  });

  describe("Waiting for network response", () => {
    beforeEach(() => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <MockedProvider mocks={[]} addTypename={false}>
              <EditPatient
                facilityId={mockFacilityID}
                patientId={mockPatientID}
              />
            </MockedProvider>
          </Provider>
        </MemoryRouter>
      );
    });
    it("shows loading text", async () => {
      expect(
        screen.getAllByText("loading...", { exact: false })[0]
      ).toBeInTheDocument();
    });
  });

  describe("phone number input", () => {
    beforeEach(async () => {
      const mocks = [
        {
          request: {
            query: GET_PATIENT,
            variables: {
              id: mockPatientID,
            },
          },
          result: {
            data: {
              patient: {
                firstName: "Eugenia",
                middleName: null,
                lastName: "Franecki",
                birthDate: "1939-10-11",
                street: "736 Jackson PI NW",
                streetTwo: "DC",
                city: null,
                state: "DC",
                zipCode: null,
                telephone: "(634) 397-4114",
                phoneNumbers: [
                  {
                    type: "LANDLINE",
                    number: "(631) 867-5309",
                  },
                  {
                    type: "MOBILE",
                    number: "(634) 397-4114",
                  },
                ],
                role: "UNKNOWN",
                emails: ["foo@bar.com"],
                county: null,
                race: null,
                ethnicity: null,
                gender: null,
                residentCongregateSetting: true,
                employedInHealthcare: true,
                facility: null,
                testResultDelivery: null,
                tribalAffiliation: [null],
              },
            },
          },
        },
      ];

      render(
        <>
          <MemoryRouter>
            <Provider store={store}>
              <MockedProvider mocks={mocks} addTypename={false}>
                <EditPatient
                  facilityId={mockFacilityID}
                  patientId={mockPatientID}
                />
              </MockedProvider>
            </Provider>
          </MemoryRouter>
          <ToastContainer
            autoClose={5000}
            closeButton={false}
            limit={2}
            position="bottom-center"
            hideProgressBar={true}
          />
        </>
      );

      expect(
        (await screen.findAllByText("Franecki, Eugenia", { exact: false }))[0]
      ).toBeInTheDocument();
    });

    it("populates primary phone number field with patient `telephone`", () => {
      const legend = "Primary phone number";
      const input = screen.getByLabelText(legend, {
        exact: false,
      }) as HTMLInputElement;

      if (input === null) {
        throw Error(`Unable to corresponding input for ${legend}`);
      }

      // In the GraphQL response, this was the second entry in the
      // phone numbers array, but the array should be sorted to place the
      // value matching `patient.telephone` first
      expect(input.value).toBe("(634) 397-4114");
    });

    it("displays a validation failure alert if phone type not entered", async () => {
      userEvent.click(
        screen.queryAllByText("Add another number", {
          exact: false,
        })[0]
      );

      // Do not enter phone type for additional number
      const number = screen.getAllByLabelText("Additional phone number", {
        exact: false,
      })[1] as HTMLInputElement;

      fireEvent.change(number, {
        target: { value: "6318675309" },
      });

      userEvent.click(screen.getAllByText("Save changes")[0]);

      expect(
        await screen.findByText("Phone type is required", {
          exact: false,
        })
      ).toBeInTheDocument();
    });
  });

  describe("facility select input", () => {
    let component: any;
    beforeEach(async () => {
      jest
        .useFakeTimers("modern")
        .setSystemTime(new Date("2021-08-01").getTime());
      const mocks = [
        {
          request: {
            query: GET_PATIENT,
            variables: {
              id: mockPatientID,
            },
          },
          result: {
            data: {
              patient: {
                firstName: "Eugenia",
                middleName: null,
                lastName: "Franecki",
                birthDate: "1939-10-11",
                street: "736 Jackson PI NW",
                streetTwo: "DC",
                city: null,
                state: "DC",
                zipCode: null,
                telephone: "(634) 397-4114",
                phoneNumbers: [
                  {
                    type: "MOBILE",
                    number: "(634) 397-4114",
                  },
                ],
                role: "UNKNOWN",
                emails: ["foo@bar.com"],
                county: null,
                race: null,
                ethnicity: null,
                gender: null,
                residentCongregateSetting: true,
                employedInHealthcare: true,
                facility: null,
                testResultDelivery: null,
                tribalAffiliation: [null],
              },
            },
          },
        },
      ];

      component = render(
        <MemoryRouter>
          <Provider store={store}>
            <MockedProvider mocks={mocks} addTypename={false}>
              <EditPatient
                facilityId={mockFacilityID}
                patientId={mockPatientID}
              />
            </MockedProvider>
          </Provider>
        </MemoryRouter>
      );
      expect(
        (await screen.findAllByText("Franecki, Eugenia", { exact: false }))[0]
      ).toBeInTheDocument();
    });

    it("shows the form title", () => {
      expect(
        screen.getAllByText("Franecki, Eugenia", { exact: false })[0]
      ).toBeInTheDocument();
    });

    it("matches screenshot", () => {
      expect(component).toMatchSnapshot();
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
      it("patient with null facility prop maps to all facilities", () => {
        expect(facilityInput.value).toBe("~~ALL-FACILITIES~~");
      });
      it("updates its selection on change", async () => {
        fireEvent.change(facilityInput, {
          target: { value: mockFacilityID },
        });
        expect(facilityInput.value).toBe(mockFacilityID);
      });
    });
  });

  const mocks = [
    {
      request: {
        query: GET_PATIENT,
        variables: {
          id: mockPatientID,
        },
      },
      result: {
        data: {
          patient: {
            firstName: "Eugenia",
            middleName: null,
            lastName: "Franecki",
            birthDate: "1939-10-11",
            street: "736 Jackson PI NW",
            streetTwo: "DC",
            city: null,
            state: "DC",
            zipCode: null,
            telephone: "(634) 397-4114",
            phoneNumbers: [
              {
                type: "MOBILE",
                number: "(634) 397-4114",
              },
            ],
            role: "UNKNOWN",
            emails: ["foo@bar.com"],
            county: null,
            country: null,
            race: "refused",
            ethnicity: "refused",
            gender: "refused",
            residentCongregateSetting: null,
            employedInHealthcare: null,
            facility: null,
            testResultDelivery: null,
            tribalAffiliation: [null],
          },
        },
      },
    },
  ];

  describe("non-answer and unknown options", () => {
    beforeEach(async () => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <MockedProvider mocks={mocks} addTypename={false}>
              <EditPatient
                facilityId={mockFacilityID}
                patientId={mockPatientID}
              />
            </MockedProvider>
          </Provider>
        </MemoryRouter>
      );
      expect(
        (await screen.findAllByText("Franecki, Eugenia", { exact: false }))[0]
      ).toBeInTheDocument();
    });

    it("shows prefer not to answer options", () => {
      ["Race", "Are you Hispanic or Latino?", "Sex assigned at birth"].forEach(
        (legend) => {
          const fieldset = screen.getByText(legend).closest("fieldset");
          if (fieldset === null) {
            throw Error(`Unable to corresponding fieldset for ${legend}`);
          }
          const option = within(fieldset).getByLabelText(
            "Prefer not to answer"
          );
          expect(option).toBeChecked();
        }
      );
    });
    it("shows unknown answers", () => {
      ["congregate", "health care"].forEach((legend) => {
        const fieldset = screen
          .getByText(legend, { exact: false })
          .closest("fieldset");
        if (fieldset === null) {
          throw Error(`Unable to corresponding fieldset for ${legend}`);
        }
        const option = within(fieldset).getByLabelText("Unknown");
        expect(option).toBeChecked();
      });
    });
  });

  describe("form validations", () => {
    beforeEach(async () => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <MockedProvider mocks={mocks} addTypename={false}>
              <EditPatient
                facilityId={mockFacilityID}
                patientId={mockPatientID}
              />
            </MockedProvider>
          </Provider>
        </MemoryRouter>
      );
      await screen.findAllByText("Franecki, Eugenia", { exact: false });
    });
    it("defaults to USA for a patient with country as null", () => {
      expect(screen.getByLabelText("Country", { exact: false })).toHaveValue(
        "USA"
      );
    });
    it("shows validation errors", async () => {
      const name = await screen.findByLabelText("First name", { exact: false });
      // Error message on bad value
      fireEvent.change(name, { target: { value: "" } });
      fireEvent.blur(name);
      expect(
        await screen.findByText("First name is required")
      ).toBeInTheDocument();
      // No error message on good value
      fireEvent.change(name, { target: { value: "James" } });
      fireEvent.blur(name);
      await waitFor(() => {
        expect(
          screen.queryByText("First name is required")
        ).not.toBeInTheDocument();
      });
    });
  });
  describe("tribal tribal Affiliation null", () => {
    beforeEach(async () => {
      const mocksWithNull = [...mocks];
      (mocksWithNull[0].result.data.patient as any).tribalAffiliation = null;
      render(
        <MemoryRouter>
          <Provider store={store}>
            <MockedProvider mocks={mocksWithNull} addTypename={false}>
              <EditPatient
                facilityId={mockFacilityID}
                patientId={mockPatientID}
              />
            </MockedProvider>
          </Provider>
        </MemoryRouter>
      );
    });
    it("renders", async () => {
      expect(
        await screen.findByText("Franecki, Eugenia", { exact: false })
      ).toBeInTheDocument();
    });
  });
  describe("EditPatientContainer", () => {
    it("doesn't render if no facility is provided", async () => {
      render(
        <MemoryRouter initialEntries={[{ search: "?patientId=5" }]}>
          <Provider store={configureStore()({ facilities: [] })}>
            <EditPatientContainer />
          </Provider>
        </MemoryRouter>
      );
      expect(
        await screen.findByText("No facility selected", { exact: false })
      ).toBeInTheDocument();
    });
  });
});
