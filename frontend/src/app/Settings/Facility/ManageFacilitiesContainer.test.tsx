import { render, screen, act } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import { GetManagedFacilitiesDocument } from "../../../generated/graphql";

import ManageFacilitiesContainer from "./ManageFacilitiesContainer";
import { deviceTypes } from "./FacilityFormContainer.test";

const deviceSpecimenTypes: DeviceSpecimenType[] = [
  {
    internalId: "1",
    deviceType: {
      internalId: "bc0536ea-4564-4291-bbf3-0e7b0731f6e8",
      name: "Fake Device 1",
    },
    specimenType: {
      internalId: "fake-specimen-id-1",
      name: "Fake Specimen 1",
    },
  },
  {
    internalId: "2",
    deviceType: {
      internalId: "ee85bdfb-b6c9-4951-ae30-6c025be4580e",
      name: "Fake Device 2",
    },
    specimenType: {
      internalId: "fake-specimen-id-1",
      name: "Fake Specimen 1",
    },
  },
];

const mockFacility: Facility = {
  id: "c0d32060-0580-4f8f-9e3d-2e16d65c1629",
  cliaNumber: "99D1234567",
  name: "Testing Site",
  street: "1001 Rodeo Dr",
  streetTwo: "qwqweqwe123123",
  city: "Los Angeles",
  state: "CA",
  zipCode: "90000",
  phone: "(516) 432-1390",
  email: "testingsite@disorg.com",
  deviceTypes,
  orderingProvider: {
    firstName: "Fred",
    middleName: null,
    lastName: "Flintstone",
    suffix: null,
    NPI: "PEBBLES",
    street: "123 Main Street",
    streetTwo: "",
    city: "Oz",
    state: "KS",
    zipCode: "12345",
    phone: "(202) 555-1212",
  },
};

const store = configureStore([])({
  organization: {
    name: "Organization Name",
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
  },
  facilities: [{ id: mockFacility.id, name: mockFacility.name }],
  facility: { id: mockFacility.id, name: mockFacility.name },
});

const mock = [
  {
    request: {
      query: GetManagedFacilitiesDocument,
    },
    result: {
      data: {
        organization: {
          internalId: "30b1d934-a877-4b1d-9565-575afd4d797e",
          facilities: [
            {
              id: mockFacility.id,
              cliaNumber: mockFacility.cliaNumber,
              name: mockFacility.name,
              street: mockFacility.street,
              streetTwo: mockFacility.streetTwo,
              city: mockFacility.city,
              state: mockFacility.state,
              zipCode: mockFacility.zipCode,
              phone: mockFacility.phone,
              email: mockFacility.email,
              defaultDeviceType: {
                internalId: deviceSpecimenTypes[0].internalId,
              },
              deviceTypes: [
                {
                  internalId: deviceSpecimenTypes[0].internalId,
                },
                {
                  internalId: deviceSpecimenTypes[1].internalId,
                },
              ],
              deviceSpecimenTypes,
              orderingProvider: {
                firstName: "Fred",
                middleName: null,
                lastName: "Flintstone",
                suffix: null,
                NPI: "PEBBLES",
                street: "123 Main Street",
                streetTwo: "",
                city: "Oz",
                state: "KS",
                zipCode: "12345",
                phone: "(202) 555-1212",
              },
            },
          ],
        },
      },
    },
  },
];

describe("ManageFacilitiesContainer", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <MockedProvider mocks={mock}>
            <ManageFacilitiesContainer />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );
  });

  it("displays facilities", async () => {
    await act(async () => {
      expect(await screen.findByText(mockFacility.name)).toBeInTheDocument();
      expect(
        await screen.findByText(mockFacility.cliaNumber)
      ).toBeInTheDocument();
      expect(await screen.findByText(mockFacility.name)).toBeInTheDocument();
    });
  });
});
