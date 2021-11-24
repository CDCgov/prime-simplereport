import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import configureStore from "redux-mock-store";

import { getAppInsights } from "../../TelemetryService";

import { Props as FacilityFormProps } from "./FacilityForm";
import FacilityFormContainer, {
  GET_FACILITY_QUERY,
  UPDATE_FACILITY_MUTATION,
} from "./FacilityFormContainer";

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
  deviceSpecimenTypes: deviceSpecimenTypes,
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
      <button type="submit" onClick={() => f.saveFacility(mockFacility)}>
        I'm a magic fake button click me please
      </button>
    );
  };
});
jest.mock("react-router-dom", () => ({
  Redirect: () => <p>Redirected</p>,
}));

jest.mock("../../TelemetryService", () => ({
  getAppInsights: jest.fn(),
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
    { id: mockFacility.id, name: "Testing Site" },
    { id: "2", name: "Facility 2" },
  ],
  facility: { id: mockFacility.id, name: "Testing Site" },
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
        deviceType: [
          {
            internalId: "a9bd36fe-0df1-4256-93e8-9e503cabdc8b",
            name: "Abbott IDNow",
          },
        ],
        deviceSpecimenTypes,
        specimenType: [
          {
            internalId: "fake-specimen-id-1",
            name: "Fake Specimen 1",
          },
        ],
      },
    },
  },
  {
    request: {
      query: UPDATE_FACILITY_MUTATION,
      variables: {
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
        devices: mockFacility.deviceTypes,
        defaultDevice: mockFacility.defaultDevice,
        deviceSpecimenTypes: mockFacility.deviceSpecimenTypes.map(
          (dst) => dst.internalId
        ),
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
  const trackEventMock = jest.fn();

  beforeEach(() => {
    (getAppInsights as jest.Mock).mockImplementation(() => ({
      trackEvent: trackEventMock,
    }));

    render(
      <MemoryRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <FacilityFormContainer facilityId={mockFacility.id} />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );
  });

  afterEach(() => {
    (getAppInsights as jest.Mock).mockReset();
  });

  it("redirects on successful save", async () => {
    await waitForElementToBeRemoved(() => screen.queryByText("Loading..."));
    userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Redirected")).toBeDefined();
  });

  it("tracks custom telemetry event on successful save", async () => {
    await waitForElementToBeRemoved(() => screen.queryByText("Loading..."));
    userEvent.click(screen.getByRole("button"));
    expect(trackEventMock).toBeCalledWith({ name: "Save Settings" });
  });
});
