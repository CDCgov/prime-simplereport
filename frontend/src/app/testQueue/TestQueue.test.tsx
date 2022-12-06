import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore, { MockStoreEnhanced } from "redux-mock-store";

import {
  GetFacilityQueueDocument,
  RemovePatientFromQueueDocument,
} from "../../generated/graphql";
import { appPermissions } from "../permissions";
import { PATIENT_TERM } from "../../config/constants";

import TestQueue from "./TestQueue";
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
    jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);

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
      user: {
        permissions: [],
      },
    });
  });

  afterEach(() => {
    jest.spyOn(global.Math, "random").mockRestore();
  });

  it("should render the test queue", async () => {
    const { container } = render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <Provider store={store}>
            <TestQueue activeFacilityId="a1" />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );
    await new Promise((resolve) => setTimeout(resolve, 501));

    await waitFor(
      async () => {
        expect(
          screen.getByLabelText(
            `Search for a ${PATIENT_TERM} to start their test`
          )
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

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
    const removeButton = await screen.findByLabelText(
      "Close test for Doe, John A"
    );
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

  it("should render the empty queue message if no tests in the queue", async () => {
    render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <Provider
            store={mockStore({
              organization: {
                name: "Organization Name",
              },
              facilities: [
                {
                  id: "a2",
                  name: "Other Fake Facility",
                },
              ],
              user: {
                permissions: appPermissions.results.canView,
              },
            })}
          >
            <TestQueue activeFacilityId="a2" />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(
        `There are no tests running. Search for a ${PATIENT_TERM} to start their test.`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("To add results in bulk", { exact: false })
    ).toHaveTextContent(
      "To add results in bulk using a CSV file, go to Upload spreadsheet."
    );

    expect(
      screen.getByRole("link", { name: "Upload spreadsheet" })
    ).toHaveAttribute("href", `/results/upload/submit`);
  });

  it("should render the empty queue message if no tests in the queue (no canViewResults permissions)", async () => {
    render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <Provider
            store={mockStore({
              organization: {
                name: "Organization Name",
              },
              facilities: [
                {
                  id: "a2",
                  name: "Other Fake Facility",
                },
              ],
              user: {
                permissions: [],
              },
            })}
          >
            <TestQueue activeFacilityId="a2" />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(
        `There are no tests running. Search for a ${PATIENT_TERM} to start their test.`
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText("To add results in bulk", { exact: false })
    ).not.toBeInTheDocument();
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

      await screen.findByLabelText(
        `Search for a ${PATIENT_TERM} to start their test`
      );
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
  },
  deviceType: {
    internalId: "ee4f40b7-ac32-4709-be0a-56dd77bb9609",
    name: "LumiraDX",
    model: "LumiraDx SARS-CoV-2 Ag Test*",
    testLength: 15,
    supportedDiseases: [],
  },
  specimenType: {
    internalId: "8596682d-6053-4720-8a39-1f5d19ff4ed9",
    name: "Swab of internal nose",
    typeCode: "445297001",
  },
  results: [],
  dateTested: null,
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
    facility: {
      id: "f02cfff5-1921-4293-beff-e2a5d03e1fda",
      name: "Testing Site",
      deviceTypes: [
        {
          internalId: "ee4f40b7-ac32-4709-be0a-56dd77bb9609",
          name: "LumiraDX",
          testLength: 15,
          supportedDiseases: [
            {
              internalId: "6e67ea1c-f9e8-4b3f-8183-b65383ac1283",
              loinc: "96741-4",
              name: "COVID-19",
            },
          ],
          swabTypes: [
            {
              name: "Swab of internal nose",
              internalId: "8596682d-6053-4720-8a39-1f5d19ff4ed9",
              typeCode: "445297001",
            },
            {
              name: "Nasopharyngeal swab",
              internalId: "f127ef55-4133-4556-9bca-33615d071e8d",
              typeCode: "258500001",
            },
          ],
        },
        {
          internalId: "5c711888-ba37-4b2e-b347-311ca364efdb",
          name: "Abbott BinaxNow",
          testLength: 15,
          supportedDiseases: [
            {
              internalId: "6e67ea1c-f9e8-4b3f-8183-b65383ac1283",
              loinc: "96741-4",
              name: "COVID-19",
            },
          ],
          swabTypes: [
            {
              name: "Swab of internal nose",
              internalId: "8596682d-6053-4720-8a39-1f5d19ff4ed9",
              typeCode: "445297001",
            },
          ],
        },
        {
          internalId: "32b2ca2a-75e6-4ebd-a8af-b50c7aea1d10",
          name: "BD Veritor",
          testLength: 15,
          supportedDiseases: [
            {
              internalId: "6e67ea1c-f9e8-4b3f-8183-b65383ac1283",
              loinc: "96741-4",
              name: "COVID-19",
            },
          ],
          swabTypes: [
            {
              name: "Swab of internal nose",
              internalId: "8596682d-6053-4720-8a39-1f5d19ff4ed9",
              typeCode: "445297001",
            },
            {
              name: "Nasopharyngeal swab",
              internalId: "f127ef55-4133-4556-9bca-33615d071e8d",
              typeCode: "258500001",
            },
          ],
        },
        {
          internalId: "67109f6f-eaee-49d3-b8ff-c61b79a9da8e",
          name: "Multiplex",
          testLength: 15,
          supportedDiseases: [
            {
              internalId: "6e67ea1c-f9e8-4b3f-8183-b65383ac1283",
              loinc: "96741-4",
              name: "COVID-19",
            },
            {
              internalId: "e286f2a8-38e2-445b-80a5-c16507a96b66",
              loinc: "LP14239-5",
              name: "Flu A",
            },
            {
              internalId: "14924488-268f-47db-bea6-aa706971a098",
              loinc: "LP14240-3",
              name: "Flu B",
            },
          ],
          swabTypes: [
            {
              name: "Swab of internal nose",
              internalId: "8596682d-6053-4720-8a39-1f5d19ff4ed9",
              typeCode: "445297001",
            },
            {
              name: "Nasopharyngeal swab",
              internalId: "f127ef55-4133-4556-9bca-33615d071e8d",
              typeCode: "258500001",
            },
          ],
        },
      ],
    },
  },
};

const mocks = [
  {
    request: {
      query: GetFacilityQueueDocument,
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
      query: RemovePatientFromQueueDocument,
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
      query: GetFacilityQueueDocument,
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
  {
    request: {
      query: GetFacilityQueueDocument,
      variables: {
        facilityId: "a2",
      },
    },
    result: {
      data: {
        ...result.data,
        queue: [],
      },
    },
  },
];
