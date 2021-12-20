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
    await waitForElementToBeRemoved(() => screen.queryByText("Doe, John A"));
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
    internalId: "31d42f7a-0a14-46b7-bc8a-38b3b1e78659",
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
    __typename: "Patient",
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
              name: "LumiraDX",
              __typename: "DeviceType",
            },
            {
              internalId: "0f3d7426-3476-4800-97e7-3de8a93b090c",
              testLength: 15,
              name: "Quidel Sofia 2",
              __typename: "DeviceType",
            },
          ],
          defaultDeviceType: {
            internalId,
            testLength: 15,
            name: "LumiraDX",
            __typename: "DeviceType",
          },
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
          name: "LumiraDx",
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
        internalId: "0f3d7426-3476-4800-97e7-3de8a93b090c",
        deviceType: {
          internalId: "f8b9d9d6-c318-4c54-a516-76f0d9a25d32",
          name: "Quidel Sofia 2",
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
          name: "Quidel Sofia 2",
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
        patientId: "31d42f7a-0a14-46b7-bc8a-38b3b1e78659",
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
