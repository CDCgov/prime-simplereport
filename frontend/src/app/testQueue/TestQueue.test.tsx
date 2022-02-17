import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore, { MockStoreEnhanced } from "redux-mock-store";

import TestQueue, { queueQuery } from "./TestQueue";
import { REMOVE_PATIENT_FROM_QUEUE } from "./QueueItem";
import { QUERY_PATIENT } from "./addToQueue/AddToQueueSearch";

jest.mock("@microsoft/applicationinsights-react-js", () => {
  return {
    useAppInsightsContext: jest.fn(),
    useTrackEvent: () => jest.fn(),
  };
});

describe("TestQueue", () => {
  let store: MockStoreEnhanced<unknown, {}>;
  const mockStore = configureStore([]);

  beforeEach(() => {
    store = mockStore({
      organization: {
        name: "Organization Name",
      },
      facilities: [
        {
          id: "a1",
          name: "Fake Facility",
        },
      ],
    });
  });

  it("should render the test queue", async () => {
    jest
      .useFakeTimers("modern")
      .setSystemTime(new Date("2021-08-01 08:20").getTime());
    const { container } = render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <Provider store={store}>
            <TestQueue activeFacilityId="a1" />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );
    await screen.findByLabelText("Search");
    expect(await screen.findByText("Doe, John A")).toBeInTheDocument();
    expect(await screen.findByText("Smith, Jane")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it("should remove items queue using the transition group", async () => {
    render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <Provider store={store}>
            <TestQueue activeFacilityId="a1" />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );
    expect(await screen.findByText("Doe, John A")).toBeInTheDocument();
    const removeButton = (await screen.findAllByLabelText("Close"))[0];
    userEvent.click(removeButton);
    const confirmButton = await screen.findByText("Yes", { exact: false });
    userEvent.click(confirmButton);
    expect(
      screen.getByText("Submitting test data for Doe, John A...")
    ).toBeInTheDocument();
    await waitForElementToBeRemoved(
      () => screen.queryByText("Submitting test data for Doe, John A..."),
      { timeout: 10000 }
    );
    expect(screen.queryByText("Doe, John A")).not.toBeInTheDocument();
  });

  describe("clicking on test questionnaire", () => {
    beforeEach(async () => {
      await render(
        <MemoryRouter>
          <MockedProvider mocks={mocks}>
            <Provider store={store}>
              <TestQueue activeFacilityId="a1" />
            </Provider>
          </MockedProvider>
        </MemoryRouter>
      );

      await screen.findByLabelText("Search");
      expect(await screen.findByText("Doe, John A")).toBeInTheDocument();
      expect(await screen.findByText("Smith, Jane")).toBeInTheDocument();

      userEvent.click(screen.getAllByText("Test questionnaire")[0]);
    });

    it("should open test questionnaire and display emails and phone numbers correctly", () => {
      const modal = screen.getByRole("dialog");

      expect(within(modal).getByText("Test questionnaire")).toBeInTheDocument();
      expect(
        within(modal).getByText(
          "Would you like to receive a copy of your results via text message?"
        )
      ).toBeInTheDocument();
      expect(
        within(modal).getByText(
          "Would you like to receive a copy of your results via email?"
        )
      ).toBeInTheDocument();
      expect(within(modal).getByText("Doe@legacy.com")).toBeInTheDocument();
      expect(within(modal).getByText("John@legacy.com")).toBeInTheDocument();
      expect(within(modal).getByText("8178675309")).toBeInTheDocument();
      expect(within(modal).getByText("8178675911")).toBeInTheDocument();
    });
  });

  describe("device selection", () => {
    it("should select another swab type for the selected device if configured swab not available", async () => {
      const deviceSpecimenNotAvailableResult = { ...result };

      // Default device specimen for facility is not a valid type in the `deviceSpecimenTypes` array
      // returned by GraphQL. The component should select another of the facility's devices to
      // populate the dropdown initially
      deviceSpecimenNotAvailableResult.data.organization.testingFacility[0].defaultDeviceSpecimen =
        "c0c7b042-9a4f-47cd-b280-46c0daa51c86";
      deviceSpecimenNotAvailableResult.data.deviceSpecimenTypes.pop();

      const mock = {
        request: {
          query: queueQuery,
          variables: {
            facilityId: "a1",
          },
        },
        result: deviceSpecimenNotAvailableResult,
      };

      render(
        <MemoryRouter>
          <MockedProvider mocks={[mock]}>
            <Provider store={store}>
              <TestQueue activeFacilityId="a1" />
            </Provider>
          </MockedProvider>
        </MemoryRouter>
      );

      expect(
        ((await screen.findAllByText("Quidel Sofia 2"))[0] as HTMLOptionElement)
          .selected
      ).toBeTruthy();

      expect(
        ((
          await screen.findAllByText("Nasopharyngeal swab")
        )[0] as HTMLOptionElement).selected
      ).toBeTruthy();
    });

    it("should select another device if the configured device has no associated swab types", async () => {
      const deviceNotAvailableResult = { ...result };

      // The device configured as the facility default has no associated swab types - dropdown
      // should be populated with another valid device+swab type combo
      deviceNotAvailableResult.data.queue[0].deviceType = {
        internalId: internalId,
        model: "lumira",
        name: "LumiraDx",
        testLength: 15,
        __typename: "DeviceType",
      };

      deviceNotAvailableResult.data.deviceSpecimenTypes.shift();

      const mock = {
        request: {
          query: queueQuery,
          variables: {
            facilityId: "a1",
          },
        },
        result: deviceNotAvailableResult,
      };

      render(
        <MemoryRouter>
          <MockedProvider mocks={[mock]}>
            <Provider store={store}>
              <TestQueue activeFacilityId="a1" />
            </Provider>
          </MockedProvider>
        </MemoryRouter>
      );

      // The facility's default device is "LumiraDx", but that device has no associated swabs
      expect(
        ((await screen.findAllByText("Quidel Sofia 2"))[0] as HTMLOptionElement)
          .selected
      ).toBeTruthy();
    });
  });
});

const internalId = "f5c7658d-a0d5-4ec5-a1c9-eafc85fe7554";

const symptoms = JSON.stringify({
  "64531003": "false",
  "103001002": "false",
  "84229001": "false",
  "68235000": "false",
  "426000000": "false",
  "49727002": "false",
  "68962001": "false",
  "422587007": "false",
  "267036007": "false",
  "62315008": "false",
  "43724002": "false",
  "36955009": "false",
  "44169009": "false",
  "422400008": "false",
  "230145002": "false",
  "25064002": "false",
  "162397003": "false",
});

const createPatient = ({
  first,
  middle,
  last,
  birthDate,
  resultId,
}: {
  first: string;
  middle: string | null;
  last: string;
  birthDate: string;
  resultId: string;
}) => ({
  internalId: resultId,
  pregnancy: null,
  dateAdded: "2021-02-11 20:53:51.337",
  symptoms,
  symptomOnset: null,
  noSymptoms: false,
  patient: {
    internalId: resultId,
    telephone: "1234567890",
    birthDate,
    firstName: first,
    middleName: middle,
    lastName: last,
    email: `${middle}@legacy.com`,
    emails: [`${first}@legacy.com`, `${last}@legacy.com`],
    phoneNumbers: [
      {
        number: "8178675309",
        type: "MOBILE",
      },
      {
        number: "8178675911",
        type: "MOBILE",
      },
    ],
    gender: "female",
    testResultDelivery: "",
    preferredLanguage: [],
    __typename: "Patient",
  },
  deviceType: {
    internalId: "0f3d7426-3476-4800-97e7-3de8a93b090c",
    model: "quidel",
    name: "Quidel Sofia 2",
    testLength: 10,
    __typename: "DeviceType",
  },
  deviceSpecimenType: {
    internalId,
  },
  result: "",
  dateTested: null,
  patientLink: {
    internalId: "7df95d14-c9ca-406e-bed7-85da05d5eea1",
    __typename: "PatientLink",
  },
  __typename: "TestOrder",
});

// Mock data taken from network request tab in Chrome devtools
const result = {
  data: {
    queue: [
      createPatient({
        first: "John",
        middle: "A",
        last: "Doe",
        birthDate: "1996-06-19",
        resultId: "abc",
      }),
      createPatient({
        first: "Jane",
        middle: null,
        last: "Smith",
        birthDate: "2021-02-01",
        resultId: "def",
      }),
    ],
    organization: {
      testingFacility: [
        {
          id: "a1",
          deviceTypes: [
            {
              internalId,
              testLength: 15,
              model: "lumira",
              name: "LumiraDX",
              __typename: "DeviceType",
            },
            {
              internalId: "0f3d7426-3476-4800-97e7-3de8a93b090c",
              testLength: 15,
              model: "quidel",
              name: "Quidel Sofia 2",
              __typename: "DeviceType",
            },
          ],
          defaultDeviceSpecimen: internalId,
          __typename: "Facility",
        },
      ],
      __typename: "Organization",
    },
    deviceSpecimenTypes: [
      {
        internalId: "3d5c0c67-cddb-4344-8037-18008d6fe809",
        deviceType: {
          internalId: internalId,
          model: "lumira",
          name: "LumiraDx",
          testLength: 15,
          __typename: "DeviceType",
        },
        specimenType: {
          internalId: "6aa957dc-add2-4938-8788-935aec3276d4",
          name: "Swab of internal nose",
          __typename: "SpecimenType",
        },
        __typename: "DeviceSpecimenType",
      },
      {
        internalId: "f8b9d9d6-c318-4c54-a516-76f0d9a25d32",
        deviceType: {
          internalId: "0f3d7426-3476-4800-97e7-3de8a93b090c",
          model: "quidel",
          name: "Quidel Sofia 2",
          testLength: 10,
          __typename: "DeviceType",
        },
        specimenType: {
          internalId: "6e4ccb35-d177-4ea0-9226-653358f1e081",
          name: "Nasopharyngeal swab",
          __typename: "SpecimenType",
        },
        __typename: "DeviceSpecimenType",
      },
      {
        internalId: "c0c7b042-9a4f-47cd-b280-46c0daa51c86",
        deviceType: {
          internalId: "0f3d7426-3476-4800-97e7-3de8a93b090c",
          model: "quidel",
          name: "Quidel Sofia 2",
          testLength: 10,
          __typename: "DeviceType",
        },
        specimenType: {
          internalId: "6aa957dc-add2-4938-8788-935aec3276d4",
          name: "Swab of internal nose",
          __typename: "SpecimenType",
        },
        __typename: "DeviceSpecimenType",
      },
    ],
  },
};

const mocks = [
  {
    request: {
      query: queueQuery,
      variables: {
        facilityId: "a1",
      },
    },
    result,
  },
  {
    request: {
      query: QUERY_PATIENT,
      variables: {
        facilityId: "a1",
        namePrefixMatch: "",
      },
    },
    result: {},
  },
  {
    request: {
      query: REMOVE_PATIENT_FROM_QUEUE,
      variables: {
        patientId: "abc",
      },
    },
    result: {
      data: { removePatientFromQueue: null },
    },
  },
  {
    request: {
      query: queueQuery,
      variables: {
        facilityId: "a1",
      },
    },
    result: {
      data: {
        ...result.data,
        queue: result.data.queue.slice(1),
      },
    },
  },
];
