import { render, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import TestQueue, { queueQuery } from "./TestQueue";
import { QUERY_PATIENT } from "./addToQueue/AddToQueueSearch";

jest.mock("@microsoft/applicationinsights-react-js", () => {
  return {
    useAppInsightsContext: jest.fn(),
    useTrackEvent: jest.fn(),
  };
});

describe("TestQueue", () => {
  it("should render the test queue", async () => {
    const { container, getByText } = render(
      <MockedProvider mocks={mocks}>
        <TestQueue activeFacilityId="a1" />
      </MockedProvider>
    );

    await waitFor(() => new Promise((res) => setTimeout(res, 0)));

    expect(getByText("John A Doe")).toBeInTheDocument();
    expect(getByText("Jane Smith")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});

const internalId = "f5c7658d-a0d5-4ec5-a1c9-eafc85fe7554";

// Mock data taken from network request tab in Chrome devtools
const result = {
  data: {
    queue: [
      {
        internalId: "d219f594-0c9f-4269-ab34-f49e1bca49d6",
        pregnancy: null,
        dateAdded: "2021-02-11 20:53:51.337",
        symptoms: JSON.stringify({
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
        }),
        symptomOnset: null,
        noSymptoms: false,
        firstTest: false,
        priorTestDate: null,
        priorTestType: null,
        priorTestResult: "",
        deviceType: {
          internalId,
          name: "LumiraDX",
          __typename: "DeviceType",
        },
        patient: {
          internalId: "31d42f7a-0a14-46b7-bc8a-38b3b1e78659",
          telephone: "1234567890",
          birthDate: "1996-06-19",
          firstName: "John",
          middleName: "A",
          lastName: "Doe",
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
      },
      {
        internalId: "def85a2c-2f51-49dd-970b-a22ca0f13f6a",
        pregnancy: null,
        dateAdded: "2021-02-11 22:17:57.26",
        symptoms: JSON.stringify({
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
        }),
        symptomOnset: null,
        noSymptoms: false,
        firstTest: false,
        priorTestDate: null,
        priorTestType: null,
        priorTestResult: "",
        deviceType: {
          internalId,
          name: "LumiraDX",
          __typename: "DeviceType",
        },
        patient: {
          internalId: "c896c254-50a5-4a1e-91ea-9b93523dd749",
          telephone: "(222) 333-4444",
          birthDate: "2021-02-01",
          firstName: "Jane",
          middleName: null,
          lastName: "Smith",
          gender: null,
          __typename: "Patient",
        },
        result: "",
        dateTested: null,
        patientLink: {
          internalId: "af6ac6c0-22d0-4157-9801-0791327ed288",
          __typename: "PatientLink",
        },
        __typename: "TestOrder",
      },
    ],
    organization: {
      testingFacility: [
        {
          id: "a1",
          deviceTypes: [
            {
              internalId,
              name: "LumiraDX",
              __typename: "DeviceType",
            },
            {
              internalId: "0f3d7426-3476-4800-97e7-3de8a93b090c",
              name: "Quidel Sofia 2",
              __typename: "DeviceType",
            },
          ],
          defaultDeviceType: {
            internalId,
            name: "LumiraDX",
            __typename: "DeviceType",
          },
          __typename: "Facility",
        },
      ],
      __typename: "Organization",
    },
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
      },
    },
    result: {},
  },
];
