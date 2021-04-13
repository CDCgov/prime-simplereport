import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route } from "react-router";

import EditPatient, { GET_PATIENT, UPDATE_PATIENT } from "./EditPatient";

jest.mock("../commonComponents/ComboBox", () => () => <></>);

const mockStore = configureStore([]);

describe("EditPatient", () => {
  afterEach(cleanup);

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
        await screen.queryAllByText("loading...", { exact: false })[0]
      ).toBeInTheDocument();
    });
  });

  describe("facility select input", () => {
    let component: any;
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
                role: "UNKNOWN",
                email: "foo@bar.com",
                county: null,
                race: null,
                ethnicity: null,
                gender: null,
                tribalAffiliation: [null],
                residentCongregateSetting: true,
                employedInHealthcare: true,
                facility: null,
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
      await act(async () => {
        await screen.findAllByText("Franecki, Eugenia", { exact: false });
      });
    });

    it("shows the form title", () => {
      expect(
        screen.queryAllByText("Franecki, Eugenia", { exact: false })[0]
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

  describe("Form Submit", () => {
    describe("Only required fields", () => {
      let component: any;
      let testLocation: any;

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
                  middleName: "",
                  lastName: "Franecki",
                  birthDate: "1939-10-11",
                  street: "736 Jackson PI NW",
                  streetTwo: "",
                  city: "",
                  state: "DC",
                  zipCode: "20503",
                  telephone: "(301) 458-4775",
                  role: "",
                  email: "",
                  county: "",
                  race: "",
                  ethnicity: "",
                  gender: "",
                  tribalAffiliation: [null],
                  residentCongregateSetting: true,
                  employedInHealthcare: true,
                  facility: null,
                },
              },
            },
          },
          {
            request: {
              query: UPDATE_PATIENT,
              variables: {
                patientId: mockPatientID,
                firstName: "Gina",
                middleName: null,
                lastName: "Franecki",
                birthDate: "1939-10-11",
                street: "736 Jackson PI NW",
                streetTwo: null,
                city: null,
                state: "DC",
                zipCode: "20503",
                telephone: "(301) 458-4775",
                role: null,
                email: null,
                county: null,
                race: null,
                ethnicity: null,
                gender: null,
                tribalAffiliation: null,
                residentCongregateSetting: true,
                employedInHealthcare: true,
                facilityId: null,
              },
            },
            result: {
              data: {
                internalId: "153f661f-b6ea-4711-b9ab-487b95198cce",
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
            <Route
              path="*"
              render={({ location }) => {
                testLocation = location;
                return <div>Redirect</div>;
              }}
            />
          </MemoryRouter>
        );
        await act(async () => {
          await screen.findAllByText("Franecki, Eugenia", { exact: false });
        });
      });
      it("can't be saved", () => {
        expect(screen.getAllByText("Save changes")[0]).toBeDisabled();
      });
      describe("After field update", () => {
        beforeEach(() => {
          fireEvent.change(
            screen.getByLabelText("First Name", {
              exact: false,
            }),
            {
              target: { value: "Gina" },
            }
          );
        });
        it("save is enabled", () => {
          expect(screen.getAllByText("Save changes")[0]).not.toBeDisabled();
        });
        describe("On save", () => {
          beforeEach(async () => {
            await act(async () => {
              fireEvent.click(
                screen.queryAllByText("Save", {
                  exact: false,
                })[0]
              );
              // for some reason the 1 second time out works but this does not
              // await screen.getAllByText("Redirect")
              await new Promise((resolve) => setTimeout(resolve, 1000));
            });
          });
          it("redirects to the person tab", () => {
            expect(testLocation.pathname).toBe("/patients/");
          });
        });
      });
    });
  });
});
