import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react-dom/test-utils";

import EditPatient, { GET_PATIENT } from "./EditPatient";

const mockStore = configureStore([]);

jest.mock("react-router-dom", () => ({
  Prompt: (props: any) => <></>,
  Link: (props: any) => <></>,
  useHistory: () => ({
    listen: jest.fn(),
    push: jest.fn(),
  }),
}));

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
        <Provider store={store}>
          <MockedProvider mocks={[]} addTypename={false}>
            <EditPatient
              facilityId={mockFacilityID}
              patientId={mockPatientID}
            />
          </MockedProvider>
        </Provider>
      );
    });
    it("shows loading text", async () => {
      expect(
        await screen.queryAllByText("loading...", { exact: false })[0]
      ).toBeInTheDocument();
    });
  });

  describe("facility select input", () => {
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
                residentCongregateSetting: true,
                employedInHealthcare: true,
                facility: null,
              },
            },
          },
        },
      ];

      render(
        <Provider store={store}>
          <MockedProvider mocks={mocks} addTypename={false}>
            <EditPatient
              facilityId={mockFacilityID}
              patientId={mockPatientID}
            />
          </MockedProvider>
        </Provider>
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
});
