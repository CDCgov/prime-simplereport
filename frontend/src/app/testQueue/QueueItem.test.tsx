import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore, { MockStoreEnhanced } from "redux-mock-store";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import moment from "moment";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { getAppInsights } from "../TelemetryService";
import * as srToast from "../utils/srToast";
import {
  SubmitQueueItemDocument as SUBMIT_TEST_RESULT,
  EditQueueItemDocument as EDIT_QUEUE_ITEM,
  PhoneType,
  SubmitQueueItemMutationVariables as SUBMIT_QUEUE_ITEM_VARIABLES,
  EditQueueItemMutationVariables as EDIT_QUEUE_ITEM_VARIABLES,
  SubmitQueueItemMutation as SUBMIT_QUEUE_ITEM_DATA,
  EditQueueItemMutation as EDIT_QUEUE_ITEM_DATA,
} from "../../generated/graphql";
import SRToastContainer from "../commonComponents/SRToastContainer";
import PrimeErrorBoundary from "../PrimeErrorBoundary";
import { TestCorrectionReason } from "../testResults/TestResultCorrectionModal";

import QueueItem, {
  QueriedFacility,
  QueriedTestOrder,
  QueueItemProps,
} from "./QueueItem";
import mockSupportedDiseaseCovid from "./mocks/mockSupportedDiseaseCovid";
import mockSupportedDiseaseMultiplex, {
  mockSupportedDiseaseFlu,
} from "./mocks/mockSupportedDiseaseMultiplex";

jest.mock("../TelemetryService", () => ({
  getAppInsights: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

const updatedDateString = "2021-03-10";
const updatedTimeString = "10:05";

const setStartTestPatientIdMock = jest.fn();

const device1Name = "LumiraDX";
const device2Name = "Abbott BinaxNow";
const device3Name = "BD Veritor";
const device4Name = "Multiplex";
const device5Name = "MultiplexAndCovidOnly";

const device1Id = "ee4f40b7-ac32-4709-be0a-56dd77bb9609";
const device2Id = "5c711888-ba37-4b2e-b347-311ca364efdb";
const device3Id = "32b2ca2a-75e6-4ebd-a8af-b50c7aea1d10";
const device4Id = "67109f6f-eaee-49d3-b8ff-c61b79a9da8e";
const device5Id = "da524a8e-672d-4ff4-a4ec-c1e14d0337db";

const deletedDeviceId = "8ab0cafa-8e36-48d6-91fc-6352405e1d91";
const deletedDeviceName = "Deleted";

const specimen1Name = "Swab of internal nose";
const specimen1Id = "8596682d-6053-4720-8a39-1f5d19ff4ed9";
const specimen2Name = "Nasopharyngeal swab";
const specimen2Id = "f127ef55-4133-4556-9bca-33615d071e8d";

const deletedSpecimenId = "fddb9ef4-7606-4621-b7a2-20772bac5136";

const getDeciceTypeDropdown = async () =>
  (await screen.findByTestId("device-type-dropdown")) as HTMLSelectElement;

async function getSpecimenTypeDropdown() {
  return (await screen.findByTestId(
    "specimen-type-dropdown"
  )) as HTMLSelectElement;
}

describe("QueueItem", () => {
  let nowFn = Date.now;
  let store: MockStoreEnhanced<unknown, {}>;
  const mockStore = configureStore([]);
  const trackEventMock = jest.fn();

  const queueItemInfo: QueriedTestOrder = {
    internalId: "1b02363b-ce71-4f30-a2d6-d82b56a91b39",
    pregnancy: "60001007",
    dateAdded: "2022-11-08 13:33:07.503",
    symptoms:
      '{"64531003":"false","103001002":"false","84229001":"false","68235000":"false","426000000":"false","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}',
    symptomOnset: null,
    noSymptoms: true,
    deviceType: {
      internalId: device1Id,
      name: device1Name,
      model: "LumiraDx SARS-CoV-2 Ag Test*",
      testLength: 15,
    },
    specimenType: {
      internalId: specimen1Id,
      name: specimen1Name,
      typeCode: "445297001",
    },
    patient: {
      internalId: "72b3ce1e-9d5a-4ad2-9ae8-e1099ed1b7e0",
      telephone: "(571) 867-5309",
      birthDate: "2015-09-20",
      firstName: "Althea",
      middleName: "Hedda Mclaughlin",
      lastName: "Dixon",
      gender: "refused",
      testResultDelivery: null,
      preferredLanguage: null,
      email: "sywaporoce@mailinator.com",
      emails: ["sywaporoce@mailinator.com"],
      phoneNumbers: [
        {
          type: PhoneType.Mobile,
          number: "(553) 223-0559",
        },
        {
          type: PhoneType.Landline,
          number: "(669) 789-0799",
        },
      ],
    },
    results: [],
    dateTested: null,
    correctionStatus: "ORIGINAL",
    reasonForCorrection: null,
  };

  const facilityInfo: QueriedFacility = {
    id: "f02cfff5-1921-4293-beff-e2a5d03e1fda",
    name: "Testing Site",
    deviceTypes: [
      {
        internalId: device1Id,
        name: device1Name,
        testLength: 15,
        supportedDiseaseTestPerformed: mockSupportedDiseaseCovid,
        swabTypes: [
          {
            name: specimen1Name,
            internalId: specimen1Id,
            typeCode: "445297001",
          },
          {
            name: specimen2Name,
            internalId: specimen2Id,
            typeCode: "258500001",
          },
        ],
      },
      {
        internalId: device2Id,
        name: device2Name,
        testLength: 15,
        supportedDiseaseTestPerformed: mockSupportedDiseaseCovid,
        swabTypes: [
          {
            name: specimen1Name,
            internalId: specimen1Id,
            typeCode: "445297001",
          },
        ],
      },
      {
        internalId: device3Id,
        name: device3Name,
        testLength: 15,
        supportedDiseaseTestPerformed: mockSupportedDiseaseCovid,
        swabTypes: [
          {
            name: specimen1Name,
            internalId: specimen1Id,
            typeCode: "445297001",
          },
          {
            name: specimen2Name,
            internalId: specimen2Id,
            typeCode: "258500001",
          },
        ],
      },
      {
        internalId: device4Id,
        name: device4Name,
        testLength: 15,
        supportedDiseaseTestPerformed: mockSupportedDiseaseMultiplex,
        swabTypes: [
          {
            name: specimen1Name,
            internalId: specimen1Id,
            typeCode: "445297001",
          },
          {
            name: specimen2Name,
            internalId: specimen2Id,
            typeCode: "258500001",
          },
        ],
      },
      {
        internalId: device5Id,
        name: device5Name,
        testLength: 15,
        supportedDiseaseTestPerformed: [
          ...mockSupportedDiseaseFlu,
          {
            supportedDisease: mockSupportedDiseaseCovid[0].supportedDisease,
            testPerformedLoincCode: "123456",
            testOrderedLoincCode: "445566",
          },
          {
            supportedDisease: mockSupportedDiseaseCovid[0].supportedDisease,
            testPerformedLoincCode: "123456",
            testOrderedLoincCode: "778899",
          },
        ],
        swabTypes: [
          {
            name: specimen1Name,
            internalId: specimen1Id,
            typeCode: "445297001",
          },
          {
            name: specimen2Name,
            internalId: specimen2Id,
            typeCode: "258500001",
          },
        ],
      },
    ],
  };

  const devicesMap = new Map();
  facilityInfo.deviceTypes.map((d) => devicesMap.set(d.internalId, d));

  const testProps: QueueItemProps = {
    refetchQueue: jest.fn().mockReturnValue(null),
    queueItem: queueItemInfo,
    facility: facilityInfo,
    devicesMap: devicesMap,
    startTestPatientId: "",
    setStartTestPatientId: setStartTestPatientIdMock,
  };

  type testRenderProps = {
    props?: QueueItemProps;
    mocks?: any;
  };

  const renderQueueItem = async (
    { props, mocks }: testRenderProps = { props: testProps, mocks: undefined }
  ) => {
    props = props || testProps;

    const { container } = render(
      <PrimeErrorBoundary>
        <Provider store={store}>
          <MemoryRouter>
            <MockedProvider mocks={mocks} addTypename={false}>
              <QueueItem
                refetchQueue={props.refetchQueue}
                queueItem={props.queueItem}
                startTestPatientId={props.startTestPatientId}
                setStartTestPatientId={props.setStartTestPatientId}
                facility={props.facility}
                devicesMap={props.devicesMap}
              />
            </MockedProvider>
          </MemoryRouter>
        </Provider>
        <SRToastContainer />
      </PrimeErrorBoundary>
    );
    await new Promise((resolve) => setTimeout(resolve, 501));
    return container;
  };

  beforeEach(() => {
    store = mockStore({
      organization: {
        name: "Organization Name",
      },
    });

    (getAppInsights as jest.Mock).mockImplementation(() => ({
      trackEvent: trackEventMock,
    }));
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(global.Math, "random").mockReturnValue(1);
  });

  afterEach(() => {
    Date.now = nowFn;
    (getAppInsights as jest.Mock).mockReset();
    jest.spyOn(console, "error").mockRestore();
    jest.spyOn(global.Math, "random").mockRestore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("matches snapshot", async () => {
    expect(await renderQueueItem()).toMatchSnapshot();
  });

  it("correctly renders the test queue", async () => {
    await renderQueueItem();
    expect(
      screen.getByText("Dixon, Althea Hedda Mclaughlin")
    ).toBeInTheDocument();
    expect(screen.getByTestId("timer")).toHaveTextContent("15:00");
  });

  it("scroll to patient and highlight when startTestPatientId is present", async () => {
    let scrollIntoViewMock = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    await renderQueueItem({
      props: {
        ...testProps,
        startTestPatientId: queueItemInfo.patient.internalId,
      },
    });

    const testCard = await screen.findByTestId(
      `test-card-${queueItemInfo.patient.internalId}`
    );
    expect(testCard).toHaveClass("prime-queue-item__info");
    expect(testCard).toBeInTheDocument();
    expect(scrollIntoViewMock).toBeCalled();
  });

  it("navigates to edit the user when clicking their name", async () => {
    await renderQueueItem();
    const patientName = screen.getByText("Dixon, Althea Hedda Mclaughlin");
    expect(patientName).toBeInTheDocument();
    await userEvent.click(patientName);
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: `/patient/${queueItemInfo.patient.internalId}`,
      search: `?facility=${facilityInfo.id}&fromQueue=true`,
    });
  });

  it("updates the timer when a device is changed", async () => {
    await renderQueueItem();
    await userEvent.type(screen.getByTestId("device-type-dropdown"), "lumira");

    expect(await screen.findByTestId("timer")).toHaveTextContent("15:00");
  });

  it("renders dropdown of device types", async () => {
    await renderQueueItem();

    const deviceDropdown = (await screen.findByTestId(
      "device-type-dropdown"
    )) as HTMLSelectElement;

    expect(deviceDropdown.options.length).toEqual(5);
    expect(deviceDropdown.options[0].label).toEqual("Abbott BinaxNow");
    expect(deviceDropdown.options[1].label).toEqual("BD Veritor");
    expect(deviceDropdown.options[2].label).toEqual("LumiraDX");
    expect(deviceDropdown.options[3].label).toEqual("Multiplex");
    expect(deviceDropdown.options[4].label).toEqual("MultiplexAndCovidOnly");

    await userEvent.selectOptions(deviceDropdown, "Abbott BinaxNow");

    expect(
      ((await screen.findByText("Abbott BinaxNow")) as HTMLOptionElement)
        .selected
    ).toBeTruthy();
    expect(
      ((await screen.findByText("LumiraDX")) as HTMLOptionElement).selected
    ).toBeFalsy();
  });

  it("renders dropdown of swab types configured with selected device", async () => {
    await renderQueueItem();
    const swabDropdown = (await screen.findByTestId(
      "specimen-type-dropdown"
    )) as HTMLSelectElement;

    expect(swabDropdown.options.length).toEqual(2);
    expect(swabDropdown.options[0].label).toEqual("Nasopharyngeal swab");
    expect(swabDropdown.options[1].label).toEqual("Swab of internal nose");

    // swab on the queue item is auto selected
    expect(
      (
        (await screen.findByText(
          queueItemInfo.specimenType.name
        )) as HTMLOptionElement
      ).selected
    ).toBeTruthy();

    await userEvent.selectOptions(swabDropdown, "Nasopharyngeal swab");

    expect(
      ((await screen.findByText("Nasopharyngeal swab")) as HTMLOptionElement)
        .selected
    ).toBeTruthy();
  });

  it("correctly handles when device is deleted from facility", async () => {
    const mocks = [
      {
        request: {
          query: EDIT_QUEUE_ITEM,
          variables: {
            id: queueItemInfo.internalId,
            deviceTypeId: deletedDeviceId,
            specimenTypeId: specimen1Id,
            results: [{ diseaseName: "COVID-19", testResult: "POSITIVE" }],
            dateTested: null,
          } as EDIT_QUEUE_ITEM_VARIABLES,
        },
        result: {
          data: {
            editQueueItem: {
              results: [
                {
                  disease: { name: "COVID-19" },
                  testResult: "POSITIVE",
                },
              ],
              dateTested: null,
              deviceType: {
                internalId: deletedDeviceId,
                testLength: 10,
              },
            },
          } as EDIT_QUEUE_ITEM_DATA,
        },
      },
      {
        request: {
          query: EDIT_QUEUE_ITEM,
          variables: {
            id: queueItemInfo.internalId,
            deviceTypeId: device1Id,
            specimenTypeId: specimen1Id,
            results: [{ diseaseName: "COVID-19", testResult: "POSITIVE" }],
            dateTested: null,
          } as EDIT_QUEUE_ITEM_VARIABLES,
        },
        result: {
          data: {
            editQueueItem: {
              results: [
                {
                  disease: { name: "COVID-19" },
                  testResult: "POSITIVE",
                },
              ],
              dateTested: null,
              deviceType: {
                internalId: device1Id,
                testLength: 10,
              },
            },
          } as EDIT_QUEUE_ITEM_DATA,
        },
      },
    ];

    const props = {
      ...testProps,
      queueItem: {
        ...testProps.queueItem,
        deviceType: {
          internalId: deletedDeviceId,
          name: deletedDeviceName,
          model: "test",
          testLength: 12,
          supportedDiseaseTestPerformed: mockSupportedDiseaseCovid,
        },
        correctionStatus: "CORRECTED",
        reasonForCorrection: TestCorrectionReason.INCORRECT_RESULT,
      },
    };

    await renderQueueItem({ props, mocks });

    const deviceDropdown = await getDeciceTypeDropdown();
    expect(deviceDropdown.options.length).toEqual(6);
    expect(deviceDropdown.options[0].label).toEqual("");
    expect(deviceDropdown.options[1].label).toEqual("Abbott BinaxNow");
    expect(deviceDropdown.options[2].label).toEqual("BD Veritor");
    expect(deviceDropdown.options[3].label).toEqual("LumiraDX");
    expect(deviceDropdown.options[4].label).toEqual("Multiplex");
    expect(deviceDropdown.options[5].label).toEqual("MultiplexAndCovidOnly");

    expect(deviceDropdown.value).toEqual("");

    const swabDropdown = await getSpecimenTypeDropdown();
    expect(swabDropdown.options.length).toEqual(0);
    expect(swabDropdown).toBeDisabled();

    // disables submitting results and changing date
    const submitButton = screen.getByText("Submit") as HTMLInputElement;
    const positiveResult = screen.getByLabelText("Positive", {
      exact: false,
    }) as HTMLInputElement;
    const currentDateTimeButton = screen.getByLabelText("Current date/time", {
      exact: false,
    }) as HTMLInputElement;

    expect(submitButton).toBeDisabled();
    expect(positiveResult).toBeDisabled();
    expect(currentDateTimeButton).toBeDisabled();

    // notice the error message
    expect(screen.getByText("Please select a device")).toBeInTheDocument();

    await userEvent.selectOptions(deviceDropdown, device1Id);
    await new Promise((resolve) => setTimeout(resolve, 501));

    // error goes away after selecting a valid device
    expect(
      screen.queryByText("Please select a device")
    ).not.toBeInTheDocument();

    // enable selecting date/time and results
    expect(positiveResult).toBeEnabled();
    expect(currentDateTimeButton).toBeEnabled();

    // enables submitting of results after selecting one
    await userEvent.click(positiveResult);
    await new Promise((resolve) => setTimeout(resolve, 501));
    expect(submitButton).toBeEnabled();
  });

  it("correctly handles when swab is deleted from device", async () => {
    const mocks = [
      {
        request: {
          query: EDIT_QUEUE_ITEM,
          variables: {
            id: queueItemInfo.internalId,
            deviceTypeId: device2Id,
            specimenTypeId: deletedSpecimenId,
            results: [{ diseaseName: "COVID-19", testResult: "POSITIVE" }],
            dateTested: null,
          } as EDIT_QUEUE_ITEM_VARIABLES,
        },
        result: {
          data: {
            editQueueItem: {
              results: [
                {
                  disease: { name: "COVID-19" },
                  testResult: "POSITIVE",
                },
              ],
              dateTested: null,
              deviceType: {
                internalId: device2Id,
                testLength: 10,
              },
            },
          } as EDIT_QUEUE_ITEM_DATA,
        },
      },
      {
        request: {
          query: EDIT_QUEUE_ITEM,
          variables: {
            id: queueItemInfo.internalId,
            deviceTypeId: device1Id,
            specimenTypeId: specimen1Id,
            results: [{ diseaseName: "COVID-19", testResult: "POSITIVE" }],
            dateTested: null,
          } as EDIT_QUEUE_ITEM_VARIABLES,
        },
        result: {
          data: {
            editQueueItem: {
              results: [
                {
                  disease: { name: "COVID-19" },
                  testResult: "POSITIVE",
                },
              ],
              dateTested: null,
              deviceType: {
                internalId: device1Id,
                testLength: 10,
              },
            },
          } as EDIT_QUEUE_ITEM_DATA,
        },
      },
    ];

    const props = {
      ...testProps,
      queueItem: {
        ...testProps.queueItem,
        deviceType: {
          internalId: device2Id,
          name: device2Name,
          model: "test",
          testLength: 12,
          supportedDiseases: [
            {
              internalId: "6e67ea1c-f9e8-4b3f-8183-b65383ac1283",
              loinc: "96741-4",
              name: "COVID-19",
            },
          ],
        },
        specimenType: {
          name: "deleted",
          internalId: deletedSpecimenId,
          typeCode: "12345",
        },
        correctionStatus: "CORRECTED",
        reasonForCorrection: TestCorrectionReason.INCORRECT_RESULT,
      },
    };

    await renderQueueItem({ props, mocks });

    const deviceDropdown = await getDeciceTypeDropdown();
    expect(deviceDropdown.options.length).toEqual(5);
    expect(deviceDropdown.options[0].label).toEqual("Abbott BinaxNow");
    expect(deviceDropdown.options[1].label).toEqual("BD Veritor");
    expect(deviceDropdown.options[2].label).toEqual("LumiraDX");
    expect(deviceDropdown.options[3].label).toEqual("Multiplex");
    expect(deviceDropdown.options[4].label).toEqual("MultiplexAndCovidOnly");
    expect(deviceDropdown.value).toEqual(device2Id);

    const swabDropdown = await getSpecimenTypeDropdown();
    expect(swabDropdown.options.length).toEqual(2);
    expect(swabDropdown.options[0].label).toEqual("");
    expect(swabDropdown.options[1].label).toEqual("Swab of internal nose");

    // disables submitting results and changing date
    const currentDateTimeButton = screen.getByLabelText("Current date/time", {
      exact: false,
    }) as HTMLInputElement;
    const positiveResult = screen.getByLabelText("Positive", {
      exact: false,
    }) as HTMLInputElement;
    const submitButton = screen.getByText("Submit") as HTMLInputElement;

    expect(currentDateTimeButton).toBeDisabled();
    expect(positiveResult).toBeDisabled();
    expect(submitButton).toBeDisabled();

    // notice the error message
    expect(screen.getByText("Please select a swab type")).toBeInTheDocument();

    await userEvent.selectOptions(swabDropdown, specimen1Id);
    await new Promise((resolve) => setTimeout(resolve, 501));

    // error goes away after selecting a valid device
    expect(
      screen.queryByText("Please select a swab type")
    ).not.toBeInTheDocument();

    // enable selecting date/time and results
    expect(positiveResult).toBeEnabled();
    expect(currentDateTimeButton).toBeEnabled();

    // enables submitting of results after selecting one
    await userEvent.click(positiveResult);
    await new Promise((resolve) => setTimeout(resolve, 501));
    expect(submitButton).toBeEnabled();
  });

  describe("on device specimen type change", () => {
    const mocks = [
      {
        request: {
          query: EDIT_QUEUE_ITEM,
          variables: {
            id: queueItemInfo.internalId,
            deviceTypeId: device1Id,
            specimenTypeId: specimen1Id,
            results: [{ diseaseName: "COVID-19", testResult: "POSITIVE" }],
            dateTested: null,
          } as EDIT_QUEUE_ITEM_VARIABLES,
        },
        result: {
          data: {
            editQueueItem: {
              results: [
                {
                  disease: { name: "COVID-19" },
                  testResult: "POSITIVE",
                },
              ],
              dateTested: null,
              deviceType: {
                internalId: device1Id,
                testLength: 10,
              },
            },
          } as EDIT_QUEUE_ITEM_DATA,
        },
      },
      {
        request: {
          query: EDIT_QUEUE_ITEM,
          variables: {
            id: queueItemInfo.internalId,
            deviceTypeId: device3Id,
            specimenTypeId: specimen1Id,
            results: [{ diseaseName: "COVID-19", testResult: "POSITIVE" }],
            dateTested: null,
          } as EDIT_QUEUE_ITEM_VARIABLES,
        },
        result: {
          data: {
            editQueueItem: {
              results: [
                {
                  disease: { name: "COVID-19" },
                  testResult: "POSITIVE",
                },
              ],
              dateTested: null,
              deviceType: {
                internalId: device3Id,
                testLength: 10,
              },
            },
          } as EDIT_QUEUE_ITEM_DATA,
        },
      },
      {
        request: {
          query: EDIT_QUEUE_ITEM,
          variables: {
            id: queueItemInfo.internalId,
            deviceTypeId: device3Id,
            specimenTypeId: specimen2Id,
            results: [{ diseaseName: "COVID-19", testResult: "POSITIVE" }],
            dateTested: null,
          } as EDIT_QUEUE_ITEM_VARIABLES,
        },
        result: {
          data: {
            editQueueItem: {
              results: [
                {
                  disease: { name: "COVID-19" },
                  testResult: "POSITIVE",
                },
              ],
              dateTested: null,
              deviceType: {
                internalId: device3Id,
                testLength: 10,
              },
            },
          } as EDIT_QUEUE_ITEM_DATA,
        },
      },
      {
        request: {
          query: EDIT_QUEUE_ITEM,
          variables: {
            id: queueItemInfo.internalId,
            deviceTypeId: device4Id,
            specimenTypeId: specimen1Id,
            results: [],
            dateTested: null,
          } as EDIT_QUEUE_ITEM_VARIABLES,
        },
        result: {
          data: {
            editQueueItem: {
              results: [
                {
                  disease: { name: "COVID-19" },
                  testResult: "POSITIVE",
                },
              ],
              dateTested: null,
              deviceType: {
                internalId: device4Id,
                testLength: 10,
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
              },
            },
          } as EDIT_QUEUE_ITEM_DATA,
        },
      },
    ];

    it("updates test order on device type and specimen type change", async () => {
      await renderQueueItem({ mocks });

      const deviceDropdown = await getDeciceTypeDropdown();
      expect(deviceDropdown.options.length).toEqual(5);
      expect(deviceDropdown.options[0].label).toEqual("Abbott BinaxNow");
      expect(deviceDropdown.options[1].label).toEqual("BD Veritor");
      expect(deviceDropdown.options[2].label).toEqual("LumiraDX");
      expect(deviceDropdown.options[3].label).toEqual("Multiplex");
      expect(deviceDropdown.options[4].label).toEqual("MultiplexAndCovidOnly");

      // select results
      await userEvent.click(
        screen.getByLabelText("Positive", { exact: false })
      );
      await new Promise((resolve) => setTimeout(resolve, 501));

      // Change device type
      await userEvent.selectOptions(deviceDropdown, device3Name);
      await new Promise((resolve) => setTimeout(resolve, 501));

      // Change specimen type
      const swabDropdown = await getSpecimenTypeDropdown();
      expect(swabDropdown.options.length).toEqual(2);
      expect(swabDropdown.options[0].label).toEqual("Nasopharyngeal swab");
      expect(swabDropdown.options[1].label).toEqual("Swab of internal nose");

      await userEvent.selectOptions(swabDropdown, specimen2Name);
      await new Promise((resolve) => setTimeout(resolve, 501));

      expect(deviceDropdown.value).toEqual(device3Id);
      expect(swabDropdown.value).toEqual(specimen2Id);

      await waitFor(
        () => {
          expect(screen.getByText("Submit")).toBeEnabled();
        },
        { timeout: 1000 }
      );
    });

    it("adds radio buttons for Flu A and Flu B when a multiplex device is chosen", async () => {
      await renderQueueItem({ mocks });

      expect(screen.queryByText("Flu A")).not.toBeInTheDocument();
      expect(screen.queryByText("Flu B")).not.toBeInTheDocument();

      const deviceDropdown = await getDeciceTypeDropdown();
      expect(deviceDropdown.options.length).toEqual(5);
      expect(deviceDropdown.options[0].label).toEqual("Abbott BinaxNow");
      expect(deviceDropdown.options[1].label).toEqual("BD Veritor");
      expect(deviceDropdown.options[2].label).toEqual("LumiraDX");
      expect(deviceDropdown.options[3].label).toEqual("Multiplex");
      expect(deviceDropdown.options[4].label).toEqual("MultiplexAndCovidOnly");

      // Change device type to a multiplex device
      await userEvent.selectOptions(deviceDropdown, device4Name);
      await new Promise((resolve) => setTimeout(resolve, 501));

      expect(screen.getByText("Flu A")).toBeInTheDocument();
      expect(screen.getByText("Flu B")).toBeInTheDocument();
    });
  });

  describe("SMS delivery failure", () => {
    let alertSpy: jest.SpyInstance;
    beforeEach(() => {
      alertSpy = jest.spyOn(srToast, "showError");
    });

    afterEach(() => {
      alertSpy.mockRestore();
    });

    it("displays delivery failure alert on submit for invalid patient phone number", async () => {
      const mocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: queueItemInfo.internalId,
              deviceTypeId: device1Id,
              specimenTypeId: specimen1Id,
              results: [
                { diseaseName: "COVID-19", testResult: "UNDETERMINED" },
              ],
              dateTested: null,
            } as EDIT_QUEUE_ITEM_VARIABLES,
          },
          result: {
            data: {
              editQueueItem: {
                results: [
                  {
                    disease: { name: "COVID-19" },
                    testResult: "UNDETERMINED",
                  },
                ],
                dateTested: null,
                deviceType: {
                  internalId: device1Id,
                  testLength: 10,
                },
              },
            } as EDIT_QUEUE_ITEM_DATA,
          },
        },
        {
          request: {
            query: SUBMIT_TEST_RESULT,
            variables: {
              patientId: queueItemInfo.patient.internalId,
              deviceTypeId: device1Id,
              specimenTypeId: specimen1Id,
              results: [
                { diseaseName: "COVID-19", testResult: "UNDETERMINED" },
              ],
              dateTested: null,
            } as SUBMIT_QUEUE_ITEM_VARIABLES,
          },
          result: {
            data: {
              submitQueueItem: {
                testResult: {
                  internalId: queueItemInfo.internalId,
                },
                deliverySuccess: false,
              },
            } as SUBMIT_QUEUE_ITEM_DATA,
          },
        },
      ];

      const props = {
        ...testProps,
        queueItem: {
          ...testProps.queueItem,
          pregnancy: null,
          symptomOnset: null,
          noSymptoms: null,
        },
      };

      await renderQueueItem({ props, mocks });

      // Select result
      await userEvent.click(
        screen.getByLabelText("Inconclusive", {
          exact: false,
        })
      );

      // Wait for the genuinely long-running "edit queue" operation to finish
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Submit
      await userEvent.click(screen.getByText("Submit"));
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await userEvent.click(
        screen.getByText("Submit anyway", {
          exact: false,
        })
      );

      // Displays submitting indicator
      expect(
        await screen.findByText(
          "Submitting test data for Dixon, Althea Hedda Mclaughlin..."
        )
      ).toBeInTheDocument();

      // Wait for MockedProvider to populate the mocked result
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify alert is displayed
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          "The phone number provided may not be valid or may not be able to accept text messages",
          "Unable to text result to Dixon, Althea Hedda Mclaughlin"
        );
      });
      expect(
        await screen.findByText(
          "Unable to text result to Dixon, Althea Hedda Mclaughlin",
          {
            exact: false,
          }
        )
      ).toBeInTheDocument();

      // Submitting indicator and card are gone
      expect(
        await screen.findByText("Dixon, Althea Hedda Mclaughlin")
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          "Submitting test data for Dixon, Althea Hedda Mclaughlin..."
        )
      ).toBeInTheDocument();
    });
  });

  it("updates custom test date/time", async () => {
    await renderQueueItem();
    const toggle = await screen.findByLabelText("Current date/time");
    await userEvent.click(toggle);
    const dateInput = screen.getByTestId("test-date");
    expect(dateInput).toBeInTheDocument();
    const timeInput = screen.getByTestId("test-time");
    expect(timeInput).toBeInTheDocument();
    userEvent.type(dateInput, `${updatedDateString}T00:00`);
    userEvent.type(timeInput, updatedTimeString);
  });

  it("does not allow future date for test date", async () => {
    const mocks = [
      {
        request: {
          query: EDIT_QUEUE_ITEM,
          variables: {
            id: queueItemInfo.internalId,
            deviceTypeId: device1Id,
            specimenTypeId: specimen1Id,
            results: [],
            dateTested: null,
          } as EDIT_QUEUE_ITEM_VARIABLES,
        },
        result: {
          data: {
            editQueueItem: {
              results: [
                {
                  disease: { name: "COVID-19" },
                  testResult: "UNDETERMINED",
                },
              ],
              dateTested: null,
              deviceType: {
                internalId: device1Id,
                testLength: 10,
              },
            },
          } as EDIT_QUEUE_ITEM_DATA,
        },
      },
      {
        request: {
          query: EDIT_QUEUE_ITEM,
          variables: {
            id: queueItemInfo.internalId,
            deviceTypeId: device1Id,
            specimenTypeId: specimen1Id,
            results: [],
            dateTested: "2022-07-15T12:35:00.000Z",
          } as EDIT_QUEUE_ITEM_VARIABLES,
        },
        result: {
          data: {
            editQueueItem: {
              results: [
                {
                  disease: { name: "COVID-19" },
                  testResult: "UNDETERMINED",
                },
              ],
              dateTested: null,
              deviceType: {
                internalId: device1Id,
                testLength: 10,
              },
            },
          } as EDIT_QUEUE_ITEM_DATA,
        },
      },
      {
        request: {
          query: SUBMIT_TEST_RESULT,
          variables: {
            patientId: queueItemInfo.patient.internalId,
            deviceTypeId: queueItemInfo.deviceType.internalId,
            specimenTypeId: queueItemInfo.specimenType.internalId,
            results: [{ diseaseName: "COVID-19", testResult: "UNDETERMINED" }],
            dateTested: "2022-07-15T12:35:00.000Z",
          } as SUBMIT_QUEUE_ITEM_VARIABLES,
        },
        result: {
          data: {
            submitQueueItem: {
              testResult: {
                internalId: queueItemInfo.internalId,
              },
              deliverySuccess: true,
            },
          } as SUBMIT_QUEUE_ITEM_DATA,
        },
      },
    ];

    await renderQueueItem({ mocks });

    const toggle = await screen.findByLabelText("Current date/time");
    await userEvent.click(toggle);
    await new Promise((resolve) => setTimeout(resolve, 501));

    const dateInput = screen.getByTestId("test-date");
    expect(dateInput).toBeInTheDocument();
    const timeInput = screen.getByTestId("test-time");
    expect(timeInput).toBeInTheDocument();

    // Select result
    await userEvent.click(
      screen.getByLabelText("Inconclusive", { exact: true })
    );

    // There is a 500ms debounce on queue item update operations
    await new Promise((resolve) => setTimeout(resolve, 501));

    // Input invalid (future date) - can't submit
    const futureDateTime = moment({
      year: 2050,
      month: 6,
      day: 15,
      hour: 12,
      minute: 35,
    });
    await userEvent.type(dateInput, futureDateTime.format("YYYY-MM-DD"));
    await userEvent.type(timeInput, futureDateTime.format("hh:mm"));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await waitFor(
      () => {
        expect(screen.getByText("Submit")).toBeEnabled();
      },
      { timeout: 1000 }
    );

    // Submit test
    await userEvent.click(await screen.findByText("Submit"));

    // 500ms debounce on queue item update operations plus a little extra wait time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Toast alert should appear
    expect(await screen.findByText("Invalid test date")).toBeInTheDocument();
    const updatedTestCard = await screen.findByTestId(
      `test-card-${queueItemInfo.patient.internalId}`
    );
    expect(updatedTestCard).toHaveClass("prime-queue-item__error");
    const dateLabel = await screen.findByText("Test date and time");
    expect(dateLabel).toHaveClass("queue-item-error-message");
    const updatedDateInput = await screen.findByTestId("test-date");
    expect(updatedDateInput).toHaveClass("card-test-input__error");
  });

  it("formats card with warning state if selected date input is more than six months ago", async () => {
    await renderQueueItem();

    const toggle = await screen.findByLabelText("Current date/time");
    await userEvent.click(toggle);

    const dateInput = screen.getByTestId("test-date");
    const timeInput = screen.getByTestId("test-time");

    const oldDate = moment({ year: 2022, month: 1, day: 1 });

    fireEvent.change(dateInput, {
      target: { value: oldDate.format("YYYY-MM-DD") },
    });
    const testCard = await screen.findByTestId(
      `test-card-${queueItemInfo.patient.internalId}`
    );

    expect(testCard).toHaveClass("prime-queue-item__ready");
    expect(dateInput).toHaveClass("card-correction-input");
    expect(timeInput).toHaveClass("card-correction-input");
    expect(screen.getByTestId("test-correction-header")).toBeInTheDocument();
  });

  it("highlights test corrections and includes corrector name and reason for correction", async () => {
    const props = {
      ...testProps,
      queueItem: {
        ...testProps.queueItem,
        correctionStatus: "CORRECTED",
        reasonForCorrection: TestCorrectionReason.INCORRECT_RESULT,
      },
    };

    await renderQueueItem({ props });
    const testCard = await screen.findByTestId(
      `test-card-${queueItemInfo.patient.internalId}`
    );

    // Card is highlighted for visibility
    expect(testCard).toHaveClass("prime-queue-item__ready");

    expect(
      await within(testCard).findByText("Incorrect test result", {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("displays person's mobile phone numbers", async () => {
    await renderQueueItem();

    const questionnaire = await screen.findByText("Test questionnaire");
    await userEvent.click(questionnaire);

    await screen.findByText("Required fields are marked", { exact: false });
    expect(
      screen.getByText(testProps.queueItem.patient.phoneNumbers![0]!.number!, {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(testProps.queueItem.patient.phoneNumbers![1]!.number!)
    ).not.toBeInTheDocument();
  });

  describe("when device supports covid only and multiplex", () => {
    it("should allow you to submit covid only results", async () => {
      await renderQueueItem({});

      const deviceDropdown = await getDeciceTypeDropdown();
      expect(deviceDropdown.options.length).toEqual(5);
      expect(deviceDropdown.options[0].label).toEqual("Abbott BinaxNow");
      expect(deviceDropdown.options[1].label).toEqual("BD Veritor");
      expect(deviceDropdown.options[2].label).toEqual("LumiraDX");
      expect(deviceDropdown.options[3].label).toEqual("Multiplex");
      expect(deviceDropdown.options[4].label).toEqual("MultiplexAndCovidOnly");

      // Change device type to multiplex
      await userEvent.selectOptions(deviceDropdown, device4Name);
      await new Promise((resolve) => setTimeout(resolve, 501));

      // select results
      await userEvent.click(
        within(
          screen.getByTestId(`covid-test-result-${queueItemInfo.internalId}`)
        ).getByLabelText("Positive", { exact: false })
      );
      await new Promise((resolve) => setTimeout(resolve, 501));

      // Notice submit is disabled
      expect(screen.getByText("Submit")).toBeDisabled();

      // Change device type to multiplex that supports covid only
      await userEvent.selectOptions(deviceDropdown, device5Name);
      await new Promise((resolve) => setTimeout(resolve, 501));
      expect(deviceDropdown.value).toEqual(device5Id);

      // Notice submit is enabled
      expect(screen.getByText("Submit")).toBeEnabled();
    });
  });

  describe("telemetry", () => {
    beforeEach(async () => {
      await renderQueueItem();
    });

    it("tracks removal of patient from queue as custom event", async () => {
      const button = screen.getByLabelText(
        `Close test for Dixon, Althea Hedda Mclaughlin`
      );
      await userEvent.click(button);
      const iAmSure = screen.getByText("Yes, I'm sure");
      await userEvent.click(iAmSure);
      expect(trackEventMock).toHaveBeenCalledWith({
        name: "Remove Patient From Queue",
      });
    });

    it("tracks submitted test result as custom event", async () => {
      // Select result
      await userEvent.click(
        screen.getByLabelText("Inconclusive", {
          exact: false,
        })
      );

      // Wait for the genuinely long-running "edit queue" operation to finish
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Submit
      await userEvent.click(screen.getByText("Submit"));
      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(trackEventMock).toHaveBeenCalledWith({
        name: "Submit Test Result",
      });
    });

    it("tracks AoE form updates as custom event", async () => {
      // Update AoE questionnaire
      const questionnaire = await screen.findByText("Test questionnaire");
      await userEvent.click(questionnaire);
      const symptomInput = await screen.findByText("No symptoms", {
        exact: false,
      });
      await userEvent.click(symptomInput);

      // Save changes
      const continueButton = await screen.findByText("Continue");
      await userEvent.click(continueButton);

      expect(trackEventMock).toHaveBeenCalledWith({
        name: "Update AoE Response",
      });
    });
  });
});
