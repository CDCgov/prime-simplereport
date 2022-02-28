import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

import { getAppInsights } from "../../TelemetryService";

import { Props as FacilityFormProps } from "./FacilityForm";
import FacilityFormContainer, {
  GET_FACILITY_QUERY,
  UPDATE_FACILITY_MUTATION,
} from "./FacilityFormContainer";

export const deviceTypes: DeviceType[] = [
  {
    internalId: "bc0536ea-4564-4291-bbf3-0e7b0731f6e8",
    name: "Fake Device 1",
  },
  {
    internalId: "ee85bdfb-b6c9-4951-ae30-6c025be4580e",
    name: "Fake Device 2",
  },
];

const mockFacility: Facility = {
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

const getFacilityRequest: any = {
  request: {
    query: GET_FACILITY_QUERY,
  },
  result: {
    data: {
      organization: {
        internalId: "30b1d934-a877-4b1d-9565-575afd4d797e",
        testingFacility: [
          {
            id: mockFacility.id,
            cliaNumber: "99D1234567",
            name: "Testing Site",
            street: "1001 Rodeo Dr",
            streetTwo: "qwqweqwe123123",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90000",
            phone: "(516) 432-1390",
            email: "testingsite@disorg.com",
            defaultDeviceSpecimen: {
              internalId: "bc0536ea-4564-4291-bbf3-0e7b0731f6e8",
            },
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
          },
        ],
      },
      deviceTypes,
    },
  },
};

const facilityVariables: any = {
  facilityId: mockFacility.id,
  testingFacilityName: mockFacility.name,
  cliaNumber: mockFacility.cliaNumber,
  street: mockFacility.street,
  streetTwo: mockFacility.streetTwo,
  city: mockFacility.city,
  state: mockFacility.state,
  zipCode: mockFacility.zipCode,
  phone: mockFacility.phone,
  email: mockFacility.email,
  orderingProviderFirstName: mockFacility.orderingProvider.firstName,
  orderingProviderMiddleName: mockFacility.orderingProvider.middleName,
  orderingProviderLastName: mockFacility.orderingProvider.lastName,
  orderingProviderSuffix: mockFacility.orderingProvider.suffix,
  orderingProviderNPI: mockFacility.orderingProvider.NPI,
  orderingProviderStreet: mockFacility.orderingProvider.street,
  orderingProviderStreetTwo: mockFacility.orderingProvider.streetTwo,
  orderingProviderCity: mockFacility.orderingProvider.city,
  orderingProviderState: mockFacility.orderingProvider.state,
  orderingProviderZipCode: mockFacility.orderingProvider.zipCode,
  orderingProviderPhone: mockFacility.orderingProvider.phone || null,
  devices: mockFacility.deviceTypes.map((d) => d.internalId),
};

const store = configureStore([])({
  organization: {
    name: "Organization Name",
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
  },
  facilities: [
    { id: mockFacility.id, name: "Testing Site" },
    { id: "2", name: "Facility 2" },
  ],
  facility: { id: mockFacility.id, name: "Testing Site" },
});

const mocks = [
  getFacilityRequest,
  {
    request: {
      query: UPDATE_FACILITY_MUTATION,
      variables: facilityVariables,
    },
    result: {
      data: {
        updateFacility: {
          id: mockFacility.id,
        },
      },
    },
  },
];

jest.mock("./FacilityForm", () => {
  return (f: FacilityFormProps) => {
    return (
      <button type="submit" onClick={() => f.saveFacility(mockFacility)}>
        I'm a magic fake button click me please
      </button>
    );
  };
});
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    Navigate: () => <p>Redirected</p>,
  };
});
jest.mock("../../TelemetryService", () => ({
  getAppInsights: jest.fn(),
}));

describe("FacilityFormContainer", () => {
  const trackEventMock = jest.fn();

  beforeEach(() => {
    (getAppInsights as jest.Mock).mockImplementation(() => ({
      trackEvent: trackEventMock,
    }));
    render(
      <Provider store={store}>
        <MockedProvider mocks={mocks}>
          <MemoryRouter initialEntries={[`/facility/${mockFacility.id}`]}>
            <Routes>
              <Route
                path="facility/:facilityId"
                element={<FacilityFormContainer />}
              />
            </Routes>
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );
  });

  afterEach(() => {
    (getAppInsights as jest.Mock).mockReset();
  });

  it("redirects on successful facilty update", async () => {
    await waitForElementToBeRemoved(() => screen.queryByText("Loading..."));
    userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Redirected")).toBeInTheDocument();
  });

  it("tracks custom telemetry event on successful facility update", async () => {
    await waitForElementToBeRemoved(() => screen.queryByText("Loading..."));
    userEvent.click(screen.getByRole("button"));
    expect(trackEventMock).toBeCalledWith({ name: "Save Settings" });
  });
});
