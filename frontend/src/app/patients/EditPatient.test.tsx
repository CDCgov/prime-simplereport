import qs from "querystring";

import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import MockDate from "mockdate";

import SRToastContainer from "../commonComponents/SRToastContainer";
import { PATIENT_TERM_CAP } from "../../config/constants";

import EditPatient, { GET_PATIENT, UPDATE_PATIENT } from "./EditPatient";
import EditPatientContainer from "./EditPatientContainer";

jest.mock("@trussworks/react-uswds", () => ({
  ComboBox: () => <></>,
}));
const mockStore = configureStore([]);

const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";
const mockPatientID = "555e8a40-0f95-458e-a038-6b500a0fc2ad";
const store = mockStore({
  facilities: [{ id: mockFacilityID, name: "123" }],
});

const RouterWithFacility: React.FC<RouterWithFacilityProps> = ({
  children,
}) => (
  <MemoryRouter initialEntries={[`/patient?facility=${mockFacilityID}`]}>
    <Routes>{children}</Routes>
  </MemoryRouter>
);

describe("EditPatient", () => {
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

  describe("post-submit actions", () => {
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
              city: "Washington",
              state: "DC",
              country: "USA",
              zipCode: "12345",
              telephone: "(270) 867-5309",
              phoneNumbers: [
                {
                  type: "LANDLINE",
                  number: "(631) 867-5309",
                },
                {
                  type: "MOBILE",
                  number: "(270) 867-5309",
                },
              ],
              role: "UNKNOWN",
              emails: ["foo@bar.com"],
              county: null,
              race: "white",
              ethnicity: "hispanic",
              gender: "male",
              residentCongregateSetting: true,
              employedInHealthcare: true,
              facility: null,
              testResultDelivery: null,
              tribalAffiliation: [null],
            },
          },
        },
      },
      {
        request: {
          query: UPDATE_PATIENT,
          variables: {
            patientId: "555e8a40-0f95-458e-a038-6b500a0fc2ad",
            firstName: "Fake Name",
            middleName: null,
            lastName: "Franecki",
            birthDate: "1939-10-11",
            street: "736 Jackson PI NW",
            streetTwo: "DC",
            city: "Washington",
            state: "DC",
            country: "USA",
            zipCode: "12345",
            telephone: "(270) 867-5309",
            phoneNumbers: [
              { number: "(270) 867-5309", type: "MOBILE" },
              { number: "(631) 867-5309", type: "LANDLINE" },
            ],
            role: "UNKNOWN",
            emails: ["foo@bar.com"],
            county: null,
            race: "white",
            ethnicity: "hispanic",
            gender: "male",
            residentCongregateSetting: true,
            employedInHealthcare: true,
            facility: null,
            testResultDelivery: null,
            tribalAffiliation: undefined,
            facilityId: null,
          },
        },
        result: {
          data: {
            updatePatient: {
              internalId: "153f661f-b6ea-4711-b9ab-487b95198cce",
              facility: {
                id: "facility-id-001",
              },
            },
          },
        },
      },
    ];

    let renderWithRoutes = (
      facilityId: string,
      patientId: string,
      fromQueue: boolean
    ) => {
      const Queue = () => {
        const location = useLocation();
        return <p>Testing Queue! {location.search}</p>;
      };

      render(
        <Provider store={store}>
          <MockedProvider mocks={mocks} addTypename={false}>
            <RouterWithFacility>
              <Route
                element={
                  <EditPatient
                    facilityId={facilityId}
                    patientId={patientId}
                    fromQueue={fromQueue}
                  />
                }
                path={"/patient/"}
              />
              <Route path={"/patients"} element={<p>Patients!</p>} />
              <Route path={"/queue"} element={<Queue />} />
            </RouterWithFacility>
          </MockedProvider>
        </Provider>
      );
    };

    it("can redirect to the new test form upon save", async () => {
      renderWithRoutes(mockFacilityID, mockPatientID, false);
      expect(await screen.findByText(/Loading/i));
      await waitFor(() =>
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
      );

      // Make an arbitrary change on the form to allow submission
      const name = await screen.findByLabelText("First name", { exact: false });
      // Error message on bad value
      fireEvent.change(name, { target: { value: "Fake Name" } });
      fireEvent.blur(name);

      const saveAndStartButton = screen.getByText("Save and start test", {
        exact: false,
      });

      expect(saveAndStartButton).toBeEnabled();

      await act(async () => await userEvent.click(saveAndStartButton));

      await waitFor(() => {
        expect(
          screen.getByText("Testing Queue!", { exact: false })
        ).toBeInTheDocument();
      });
    });
    it("redirects to test queue on save when coming from Conduct tests page", async () => {
      renderWithRoutes(mockFacilityID, mockPatientID, true);
      expect(await screen.findByText(/Loading/i));
      await waitFor(() =>
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
      );

      // Make an arbitrary change on the form to allow submission
      const name = await screen.findByLabelText("First name", { exact: false });

      fireEvent.change(name, { target: { value: "Fake Name" } });
      fireEvent.blur(name);

      const saveButton = screen.getAllByText("Save changes", {
        exact: false,
      })[0];

      expect(saveButton).toBeEnabled();

      await act(async () => await userEvent.click(saveButton));

      await waitFor(() => {
        expect(
          screen.getByText("Testing Queue!", { exact: false })
        ).toBeInTheDocument();
      });
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
                telephone: "(270) 867-5309",
                phoneNumbers: [
                  {
                    type: "LANDLINE",
                    number: "(631) 867-5309",
                  },
                  {
                    type: "MOBILE",
                    number: "(270) 867-5309",
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
          <SRToastContainer />
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
      expect(input.value).toBe("(270) 867-5309");
    });

    it("displays a validation failure alert if phone type not entered", async () => {
      await act(
        async () =>
          await userEvent.click(
            screen.queryAllByText("Add another number", {
              exact: false,
            })[0]
          )
      );
      // Do not enter phone type for additional number
      await act(
        async () =>
          await userEvent.type(
            await screen.findByTestId("phoneInput-2"),
            "6378908987"
          )
      );
      await act(
        async () =>
          await userEvent.click((await screen.findAllByText("Save changes"))[0])
      );
      await waitFor(() =>
        expect(screen.queryAllByText(/Phone type is required/i)).toHaveLength(2)
      );
    });
  });

  describe("facility select input", () => {
    let component: any;
    beforeEach(async () => {
      MockDate.set("2021-08-01");
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
                telephone: "(270) 867-5309",
                phoneNumbers: [
                  {
                    type: "MOBILE",
                    number: "(270) 867-5309",
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

    afterEach(() => {
      MockDate.reset();
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
            telephone: "(270) 867-5309",
            phoneNumbers: [
              {
                type: "MOBILE",
                number: "(270) 867-5309",
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

  describe("non-answer and not sure options", () => {
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
    it("shows not sure answers", () => {
      ["group or shared housing facility", "health care"].forEach((legend) => {
        const fieldset = screen
          .getByText(legend, { exact: false })
          .closest("fieldset");
        if (fieldset === null) {
          throw Error(`Unable to corresponding fieldset for ${legend}`);
        }
        const option = within(fieldset).getByLabelText("Not sure");
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
        await screen.findByText("First name is missing")
      ).toBeInTheDocument();
      // No error message on good value
      fireEvent.change(name, { target: { value: "James" } });
      fireEvent.blur(name);
      await waitFor(() => {
        expect(
          screen.queryByText("First name is missing")
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
        <MemoryRouter initialEntries={[{ pathname: "/patient/5" }]}>
          <Provider store={store}>
            <Routes>
              <Route
                path="/patient/:patientId"
                element={<EditPatientContainer />}
              />
            </Routes>
          </Provider>
        </MemoryRouter>
      );
      expect(
        await screen.findByText("No facility selected", { exact: false })
      ).toBeInTheDocument();
    });
    it("renders EditPatient with valid params", async () => {
      const search = {
        facility: mockFacilityID,
        fromQueue: "true",
      };
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: `/patient/${mockPatientID}`,
              search: qs.stringify(search),
            },
          ]}
        >
          <Provider store={store}>
            <MockedProvider mocks={mocks} addTypename={false}>
              <Routes>
                <Route
                  path="/patient/:patientId"
                  element={<EditPatientContainer />}
                />
              </Routes>
            </MockedProvider>
          </Provider>
        </MemoryRouter>
      );
      expect(
        await screen.findByText("Franecki, Eugenia", { exact: false })
      ).toBeInTheDocument();
      expect(await screen.findByText("Conduct tests")).toBeInTheDocument();
    });
  });

  describe("edit patient from conduct tests page", () => {
    beforeEach(async () => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <MockedProvider mocks={mocks} addTypename={false}>
              <EditPatient
                facilityId={mockFacilityID}
                patientId={mockPatientID}
                fromQueue={true}
              />
            </MockedProvider>
          </Provider>
        </MemoryRouter>
      );
    });
    it("shows Conduct tests link and hides Save and start test button", async () => {
      expect(await screen.findByText("Conduct tests")).toBeInTheDocument();
      expect(screen.queryByText(PATIENT_TERM_CAP)).not.toBeInTheDocument();
      expect(screen.queryByText("Save and start test")).not.toBeInTheDocument();
    });
  });
});
