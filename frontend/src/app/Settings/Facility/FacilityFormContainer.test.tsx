import { render, screen, fireEvent, act } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import configureStore from "redux-mock-store";

import { Props as FacilityFormProps } from "./FacilityForm";
import FacilityFormContainer, {
  GET_FACILITY_QUERY,
  UPDATE_FACILITY_MUTATION,
} from "./FacilityFormContainer";

const facility: Facility = {
  id: "12345",
  cliaNumber: "99D1234567",
  name: "Testing Site",
  street: "1001 Rodeo Dr",
  streetTwo: "qwqweqwe123123",
  city: "Los Angeles",
  state: "CA",
  zipCode: "90000",
  phone: "(516) 432-1390",
  email: "testingsite@disorg.com",
  defaultDevice: "bc0536ea-4564-4291-bbf3-0e7b0731f6e8",
  deviceTypes: [
    "bc0536ea-4564-4291-bbf3-0e7b0731f6e8",
    "ee85bdfb-b6c9-4951-ae30-6c025be4580e",
  ],
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

jest.mock("./FacilityForm", () => {
  return (f: FacilityFormProps) => {
    return (
      <button type="submit" onClick={() => f.saveFacility(facility)}>
        I'm a magic fake button click me please
      </button>
    );
  };
});
jest.mock("react-router-dom", () => ({
  Redirect: () => <p>Redirected</p>,
}));

const store = configureStore([])({
  organization: {
    name: "Organization Name",
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
  },
  facilities: [
    { id: facility.id, name: "Testing Site" },
    { id: "2", name: "Facility 2" },
  ],
  facility: { id: facility.id, name: "Testing Site" },
});

const mocks = [
  {
    request: {
      query: GET_FACILITY_QUERY,
    },
    result: {
      data: {
        organization: {
          internalId: "30b1d934-a877-4b1d-9565-575afd4d797e",
          testingFacility: [
            {
              id: facility.id,
              cliaNumber: "99D1234567",
              name: "Testing Site",
              street: "1001 Rodeo Dr",
              streetTwo: "qwqweqwe123123",
              city: "Los Angeles",
              state: "CA",
              zipCode: "90000",
              phone: "(516) 432-1390",
              email: "testingsite@disorg.com",
              defaultDeviceType: {
                internalId: "bc0536ea-4564-4291-bbf3-0e7b0731f6e8",
              },
              deviceTypes: [
                {
                  internalId: "bc0536ea-4564-4291-bbf3-0e7b0731f6e8",
                },
                {
                  internalId: "ee85bdfb-b6c9-4951-ae30-6c025be4580e",
                },
              ],
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
        deviceType: [
          {
            internalId: "a9bd36fe-0df1-4256-93e8-9e503cabdc8b",
            name: "Abbott IDNow",
          },
        ],
      },
    },
  },
  {
    request: {
      query: UPDATE_FACILITY_MUTATION,
      variables: {
        facilityId: facility.id,
        testingFacilityName: facility.name,
        cliaNumber: facility.cliaNumber,
        street: facility.street,
        streetTwo: facility.streetTwo,
        city: facility.city,
        state: facility.state,
        zipCode: facility.zipCode,
        phone: facility.phone,
        email: facility.email,
        orderingProviderFirstName: facility.orderingProvider.firstName,
        orderingProviderMiddleName: facility.orderingProvider.middleName,
        orderingProviderLastName: facility.orderingProvider.lastName,
        orderingProviderSuffix: facility.orderingProvider.suffix,
        orderingProviderNPI: facility.orderingProvider.NPI,
        orderingProviderStreet: facility.orderingProvider.street,
        orderingProviderStreetTwo: facility.orderingProvider.streetTwo,
        orderingProviderCity: facility.orderingProvider.city,
        orderingProviderState: facility.orderingProvider.state,
        orderingProviderZipCode: facility.orderingProvider.zipCode,
        orderingProviderPhone: facility.orderingProvider.phone || null,
        devices: facility.deviceTypes,
        defaultDevice: facility.defaultDevice,
      },
    },
    result: {
      data: {
        updateFacility:
          "this doesn't get serialized, it's an object pointer, whoops",
      },
    },
  },
];

describe("FacilityFormContainer", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <FacilityFormContainer facilityId={facility.id} />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );
  });

  it("redirects on successful save", async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      await fireEvent.click(screen.getByRole("button"));
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(await screen.findByText("Redirected")).toBeDefined();
    });
  });
});
