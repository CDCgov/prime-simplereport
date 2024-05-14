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
import * as flaggedMock from "flagged";

import { getAppInsights } from "../../TelemetryService";
import * as srToast from "../../utils/srToast";
import {
  SubmitQueueItemDocument as SUBMIT_TEST_RESULT,
  EditQueueItemDocument as EDIT_QUEUE_ITEM,
  UpdateAoeDocument as UPDATE_AOE,
  PhoneType,
  SubmitQueueItemMutationVariables as SUBMIT_QUEUE_ITEM_VARIABLES,
  EditQueueItemMutationVariables as EDIT_QUEUE_ITEM_VARIABLES,
  UpdateAoeMutationVariables as UPDATE_AOE_VARIABLES,
  SubmitQueueItemMutation as SUBMIT_QUEUE_ITEM_DATA,
  EditQueueItemMutation as EDIT_QUEUE_ITEM_DATA,
  UpdateAoeMutation as UPDATE_AOE_DATA,
} from "../../../generated/graphql";
import SRToastContainer from "../../commonComponents/SRToastContainer";
import { TestCorrectionReason } from "../../testResults/viewResults/actionMenuModals/TestResultCorrectionModal";
import mockSupportedDiseaseCovid from "../mocks/mockSupportedDiseaseCovid";
import mockSupportedDiseaseMultiplex, {
  mockSupportedDiseaseFlu,
} from "../mocks/mockSupportedDiseaseMultiplex";
import mockSupportedDiseaseTestPerformedHIV from "../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedHIV";
import { QueriedFacility, QueriedTestOrder } from "../TestCardForm/types";

import { TestCard, TestCardProps } from "./TestCard";

jest.mock("../../TelemetryService", () => ({
  getAppInsights: jest.fn(),
}));

const mockDiseaseEnabledFlag = (diseaseName: string) =>
  jest
    .spyOn(flaggedMock, "useFeature")
    .mockImplementation((flagName: string) => {
      return flagName === `${diseaseName.toLowerCase()}Enabled`;
    });

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

// 6 instead of 7 because HIV devices are filtered out when HIV feature flag is disabled
const DEFAULT_DEVICE_OPTIONS_LENGTH = 6;

const device1Name = "LumiraDX";
const device2Name = "Abbott BinaxNow";
const device3Name = "BD Veritor";
const device4Name = "Multiplex";
const device5Name = "MultiplexAndCovidOnly";
const device6Name = "FluOnly";
const device7Name = "HIV device";

const device1Id = "DEVICE-1-ID";
const device2Id = "DEVICE-2-ID";
const device3Id = "DEVICE-3-ID";
const device4Id = "DEVICE-4-ID";
const device5Id = "DEVICE-5-ID";
const device6Id = "DEVICE-6-ID";
const device7Id = "DEVICE-7-ID";

const deletedDeviceId = "DELETED-DEVICE-ID";
const deletedDeviceName = "Deleted";

const specimen1Name = "Swab of internal nose";
const specimen1Id = "SPECIMEN-1-ID";
const specimen2Name = "Nasopharyngeal swab";
const specimen2Id = "SPECIMEN-2-ID";
const specimen3Name = "Venous blood specimen";
const specimen3Id = "SPECIMEN-3-ID";

const deletedSpecimenId = "DELETED-SPECIMEN-ID";

const getDeviceTypeDropdown = async () =>
  (await screen.findByTestId("device-type-dropdown")) as HTMLSelectElement;

async function getSpecimenTypeDropdown() {
  return (await screen.findByTestId(
    "specimen-type-dropdown"
  )) as HTMLSelectElement;
}

describe("TestCard", () => {
  let nowFn = Date.now;
  let store: MockStoreEnhanced<unknown, {}>;
  let alertSpy: jest.SpyInstance;
  const mockStore = configureStore([]);
  const trackEventMock = jest.fn();
  const removePatientFromQueueMock = jest.fn();
  const trackMetricMock = jest.fn();
  const trackExceptionMock = jest.fn();

  const testOrderInfo: QueriedTestOrder = {
    internalId: "1b02363b-ce71-4f30-a2d6-d82b56a91b39",
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
      {
        internalId: device6Id,
        name: device6Name,
        testLength: 15,
        supportedDiseaseTestPerformed: [...mockSupportedDiseaseFlu],
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
        internalId: device7Id,
        name: device7Name,
        testLength: 15,
        supportedDiseaseTestPerformed: [
          ...mockSupportedDiseaseTestPerformedHIV,
        ],
        swabTypes: [
          {
            name: specimen3Name,
            internalId: specimen3Id,
            typeCode: "122555007",
          },
        ],
      },
    ],
  };

  const DEFAULT_DEVICE_ORDER = [
    device1Name,
    device2Name,
    device3Name,
    device4Name,
    device5Name,
    device6Name,
  ].sort((a, b) => a.localeCompare(b));

  const expectDeviceOrder = (
    deviceDropdown: HTMLSelectElement,
    deviceNameOrder: string[] = DEFAULT_DEVICE_ORDER
  ) => {
    deviceNameOrder.forEach((deviceName, index) => {
      expect(deviceDropdown.options[index].label).toEqual(deviceName);
    });
  };

  const devicesMap = new Map();
  facilityInfo.deviceTypes.map((d) => devicesMap.set(d.internalId, d));

  const testProps: TestCardProps = {
    refetchQueue: jest.fn().mockReturnValue(null),
    testOrder: testOrderInfo,
    facility: facilityInfo,
    devicesMap: devicesMap,
    startTestPatientId: "",
    setStartTestPatientId: setStartTestPatientIdMock,
    removePatientFromQueue: removePatientFromQueueMock,
  };

  type testRenderProps = {
    props?: TestCardProps;
    mocks?: any;
  };

  async function renderQueueItem(
    { props, mocks }: testRenderProps = { props: testProps, mocks: [] }
  ) {
    props = props || testProps;
    const { container } = render(
      <>
        <Provider store={store}>
          <MockedProvider
            mocks={mocks}
            addTypename={true}
            defaultOptions={{
              query: { fetchPolicy: "no-cache" },
              mutate: { fetchPolicy: "no-cache" },
            }}
            showWarnings={false}
          >
            <TestCard
              refetchQueue={props.refetchQueue}
              testOrder={props.testOrder}
              startTestPatientId={props.startTestPatientId}
              setStartTestPatientId={props.setStartTestPatientId}
              facility={props.facility}
              devicesMap={props.devicesMap}
              removePatientFromQueue={props.removePatientFromQueue}
            />
          </MockedProvider>
        </Provider>
        <SRToastContainer />
      </>
    );
    return { container, user: userEvent.setup() };
  }

  beforeEach(() => {
    store = mockStore({
      organization: {
        name: "Organization Name",
      },
    });

    (getAppInsights as jest.Mock).mockImplementation(() => ({
      trackEvent: trackEventMock,
      trackMetric: trackMetricMock,
      trackException: trackExceptionMock,
    }));
    // jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(global.Math, "random").mockReturnValue(1);
    alertSpy = jest.spyOn(srToast, "showError");
  });

  afterEach(() => {
    Date.now = nowFn;
    (getAppInsights as jest.Mock).mockReset();
    jest.spyOn(console, "error").mockRestore();
    jest.spyOn(global.Math, "random").mockRestore();
    alertSpy.mockRestore();
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
    expect(screen.getByTestId("timer")).toHaveTextContent("Start timer");
  });

  it("scroll to patient and highlight when startTestPatientId is present", async () => {
    let scrollIntoViewMock = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    await renderQueueItem({
      props: {
        ...testProps,
        startTestPatientId: testOrderInfo.patient.internalId,
      },
    });

    const testCard = await screen.findByTestId(
      `test-card-${testOrderInfo.patient.internalId}`
    );
    expect(testCard).toBeInTheDocument();
    expect(scrollIntoViewMock).toBeCalled();
  });

  it("navigates to edit the user when clicking their name", async () => {
    const { user } = await renderQueueItem();
    const patientName = screen.getByText("Dixon, Althea Hedda Mclaughlin");
    expect(patientName).toBeInTheDocument();
    await user.click(patientName);
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: `/patient/${testOrderInfo.patient.internalId}`,
      search: `?facility=${facilityInfo.id}&fromQueue=true`,
    });
  });

  it("updates the timer when a device is changed", async () => {
    const { user } = await renderQueueItem();
    await user.type(screen.getByTestId("device-type-dropdown"), "lumira");

    expect(await screen.findByTestId("timer")).toHaveTextContent("Start timer");
  });

  it("renders dropdown of device types", async () => {
    const { user } = await renderQueueItem();

    const deviceDropdown = (await screen.findByTestId(
      "device-type-dropdown"
    )) as HTMLSelectElement;

    expect(deviceDropdown.options.length).toEqual(
      DEFAULT_DEVICE_OPTIONS_LENGTH
    );
    expectDeviceOrder(deviceDropdown, DEFAULT_DEVICE_ORDER);

    await user.selectOptions(deviceDropdown, "Abbott BinaxNow");

    expect(
      ((await screen.findByText("Abbott BinaxNow")) as HTMLOptionElement)
        .selected
    ).toBeTruthy();
    expect(
      ((await screen.findByText("LumiraDX")) as HTMLOptionElement).selected
    ).toBeFalsy();
  });

  it("renders dropdown of swab types configured with selected device", async () => {
    const { user } = await renderQueueItem();
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
          testOrderInfo.specimenType.name
        )) as HTMLOptionElement
      ).selected
    ).toBeTruthy();

    await user.selectOptions(swabDropdown, "Nasopharyngeal swab");

    expect(
      ((await screen.findByText("Nasopharyngeal swab")) as HTMLOptionElement)
        .selected
    ).toBeTruthy();
  });

  describe("when a selected device or specimen is deleted", () => {
    it("correctly handles when device is deleted from facility", async () => {
      const mocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: testOrderInfo.internalId,
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
              id: testOrderInfo.internalId,
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
        testOrder: {
          ...testProps.testOrder,
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

      const { user } = await renderQueueItem({ props, mocks });

      const deviceDropdown = await getDeviceTypeDropdown();
      expect(deviceDropdown.options.length).toEqual(
        DEFAULT_DEVICE_OPTIONS_LENGTH + 1
      );
      expectDeviceOrder(deviceDropdown, ["", ...DEFAULT_DEVICE_ORDER]);

      expect(deviceDropdown.value).toEqual("");

      const swabDropdown = await getSpecimenTypeDropdown();
      expect(swabDropdown.options.length).toEqual(0);
      expect(swabDropdown).toBeDisabled();

      // notice the initial error message
      expect(screen.getByText("Please select a device.")).toBeInTheDocument();

      const submitButton = screen.getByText(
        "Submit results"
      ) as HTMLInputElement;
      await user.click(submitButton);

      // attempting to submit should show error toast
      expect(screen.getByText("Invalid test device")).toBeInTheDocument();

      await user.selectOptions(deviceDropdown, device1Id);

      // error goes away after selecting a valid device
      const deviceTypeDropdownContainer = screen.getByTestId(
        "device-type-dropdown-container"
      );
      expect(
        within(deviceTypeDropdownContainer).queryByText(
          "Please select a device."
        )
      ).not.toBeInTheDocument();

      // select results
      await user.click(
        within(
          screen.getByTestId(`COVID-19-test-result-${testOrderInfo.internalId}`)
        ).getByLabelText("Positive", { exact: false })
      );
      await user.click(submitButton);

      // able to submit after selecting valid device
      // submit modal appears when able to submit but AOE responses are incomplete
      expect(screen.getByText("Submit anyway.")).toBeInTheDocument();
    });

    it("correctly handles when specimen is deleted from device", async () => {
      const mocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: testOrderInfo.internalId,
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
              id: testOrderInfo.internalId,
              deviceTypeId: device2Id,
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
        testOrder: {
          ...testProps.testOrder,
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

      const { user } = await renderQueueItem({ props, mocks });

      const deviceDropdown = await getDeviceTypeDropdown();
      expect(deviceDropdown.options.length).toEqual(
        DEFAULT_DEVICE_OPTIONS_LENGTH
      );
      expectDeviceOrder(deviceDropdown, DEFAULT_DEVICE_ORDER);
      expect(deviceDropdown.value).toEqual(device2Id);

      const swabDropdown = await getSpecimenTypeDropdown();
      expect(swabDropdown.options.length).toEqual(2);
      expect(swabDropdown.options[0].label).toEqual("");
      expect(swabDropdown.options[1].label).toEqual("Swab of internal nose");

      // notice the error message
      expect(
        screen.getByText("Please select a specimen type.")
      ).toBeInTheDocument();

      await user.selectOptions(swabDropdown, specimen1Id);

      // error goes away after selecting a valid device
      expect(
        screen.queryByText("Please select a specimen type.")
      ).not.toBeInTheDocument();
    });
  });

  describe("SMS delivery failure", () => {
    it("displays delivery failure alert on submit for invalid patient phone number", async () => {
      const mocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: testOrderInfo.internalId,
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
              patientId: testOrderInfo.patient.internalId,
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
                  internalId: testOrderInfo.internalId,
                },
                deliverySuccess: false,
              },
            } as SUBMIT_QUEUE_ITEM_DATA,
          },
        },
      ];

      const props = {
        ...testProps,
        testOrder: {
          ...testProps.testOrder,
          pregnancy: null,
          symptomOnset: null,
          noSymptoms: null,
        },
      };

      const { user } = await renderQueueItem({ props, mocks });

      // Select result
      await user.click(
        screen.getByLabelText("Inconclusive", {
          exact: false,
        })
      );

      // Submit
      await user.click(screen.getByText("Submit results"));

      await user.click(
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
    const { user } = await renderQueueItem();
    const toggle = await screen.findByLabelText("Current date and time");
    await user.click(toggle);
    const dateInput = await screen.findByTestId("test-date");
    expect(dateInput).toBeInTheDocument();
    const timeInput = await screen.findByTestId("test-time");
    expect(timeInput).toBeInTheDocument();
    await user.type(dateInput, `${updatedDateString}T00:00`);
    await user.type(timeInput, updatedTimeString);
  });

  it("shows error for future test date", async () => {
    await renderQueueItem({
      props: {
        ...testProps,
        testOrder: { ...testOrderInfo, dateTested: "2100-07-15T12:35:00.000Z" },
      },
    });

    expect(
      screen.getByText("Test date can't be in the future.", {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("formats card with warning state if selected date input is more than six months ago", async () => {
    const { user } = await renderQueueItem();

    const toggle = await screen.findByLabelText("Current date and time");
    await user.click(toggle);

    const dateInput = screen.getByTestId("test-date");
    const oldDate = moment({ year: 2022, month: 1, day: 1 });

    fireEvent.change(dateInput, {
      target: { value: oldDate.format("YYYY-MM-DD") },
    });

    expect(
      screen.getByText(
        "The date you selected is more than six months ago. Please make sure it's correct before submitting.",
        {
          exact: false,
        }
      )
    ).toBeInTheDocument();
  });

  it("warn of test corrections and reason for correction", async () => {
    const props = {
      ...testProps,
      testOrder: {
        ...testProps.testOrder,
        correctionStatus: "CORRECTED",
        reasonForCorrection: TestCorrectionReason.INCORRECT_RESULT,
      },
    };

    await renderQueueItem({ props });

    // Card is highlighted for visibility
    const alert = within(
      screen.getByTestId(`test-card-${testOrderInfo.patient.internalId}`)
    ).getByTestId("alert");
    expect(alert).toHaveClass("usa-alert--warning");

    expect(
      await within(alert).findByText("Incorrect test result", {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  describe("when device supports covid only and multiplex", () => {
    it("should allow you to submit covid only results", async () => {
      const mocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: testOrderInfo.internalId,
              deviceTypeId: device4Id,
              specimenTypeId: specimen1Id,
              results: [],
              dateTested: null,
            } as EDIT_QUEUE_ITEM_VARIABLES,
          },
          result: {
            data: {
              editQueueItem: {
                results: [],
                dateTested: null,
                deviceType: {
                  internalId: device4Id,
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
              id: testOrderInfo.internalId,
              deviceTypeId: device4Id,
              specimenTypeId: specimen1Id,
              results: [{ diseaseName: "COVID-19", testResult: "POSITIVE" }],
              dateTested: null,
            } as EDIT_QUEUE_ITEM_VARIABLES,
          },
          result: {
            data: {
              editQueueItem: {
                results: [],
                dateTested: null,
                deviceType: {
                  internalId: device4Id,
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
              id: testOrderInfo.internalId,
              deviceTypeId: device5Id,
              specimenTypeId: specimen1Id,
              results: [{ diseaseName: "COVID-19", testResult: "POSITIVE" }],
              dateTested: null,
            } as EDIT_QUEUE_ITEM_VARIABLES,
          },
          result: {
            data: {
              editQueueItem: {
                results: [],
                dateTested: null,
                deviceType: {
                  internalId: device5Id,
                  testLength: 10,
                },
              },
            } as EDIT_QUEUE_ITEM_DATA,
          },
        },
      ];

      const { user } = await renderQueueItem({ mocks });

      const deviceDropdown = await getDeviceTypeDropdown();
      expect(deviceDropdown.options.length).toEqual(
        DEFAULT_DEVICE_OPTIONS_LENGTH
      );
      expectDeviceOrder(deviceDropdown, DEFAULT_DEVICE_ORDER);

      // Change device type to multiplex
      await user.selectOptions(deviceDropdown, device4Name);

      // select results
      await user.click(
        within(
          screen.getByTestId(`COVID-19-test-result-${testOrderInfo.internalId}`)
        ).getByLabelText("Positive", { exact: false })
      );

      // Change device type to multiplex that supports covid only
      await user.selectOptions(deviceDropdown, device5Name);
      expect(deviceDropdown.value).toEqual(device5Id);

      // Notice submit is enabled
      expect(screen.getByText("Submit results")).toBeEnabled();
    });
  });

  describe("test submission and telemetry", () => {
    it("delegates removal of patient from queue to removePatientFromQueue hook", async () => {
      const { user } = await renderQueueItem();

      const button = screen.getByLabelText(
        `Close test for Dixon, Althea Hedda Mclaughlin`
      );
      await user.click(button);
      const iAmSure = screen.getByText("Yes, I'm sure");
      await user.click(iAmSure);

      expect(removePatientFromQueueMock).toHaveBeenCalledWith(
        testOrderInfo.patient.internalId
      );
    });

    it("tracks submitted test result as custom event", async () => {
      const mocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: testOrderInfo.internalId,
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
            query: SUBMIT_TEST_RESULT,
            variables: {
              patientId: testOrderInfo.patient.internalId,
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
                  internalId: testOrderInfo.internalId,
                },
                deliverySuccess: false,
              },
            } as SUBMIT_QUEUE_ITEM_DATA,
          },
        },
      ];

      const { user } = await renderQueueItem({ mocks });

      // Select result
      await user.click(
        screen.getByLabelText("Inconclusive", {
          exact: false,
        })
      );

      // Submit
      await user.click(screen.getByText("Submit results"));
      await user.click(screen.getByText("Submit anyway."));

      expect(trackEventMock).toHaveBeenCalledWith({
        name: "Submit Test Result",
      });
    });

    it("tracks AoE form updates as custom event", async () => {
      const mocks = [
        {
          request: {
            query: UPDATE_AOE,
            variables: {
              patientId: testOrderInfo.patient.internalId,
              symptoms:
                '{"25064002":false,"36955009":false,"43724002":false,"44169009":false,"49727002":false,"62315008":false,"64531003":false,"68235000":false,"68962001":false,"84229001":false,"103001002":false,"162397003":false,"230145002":false,"267036007":false,"422400008":false,"422587007":false,"426000000":false}',
              symptomOnset: null,
              noSymptoms: false,
              genderOfSexualPartners: null,
            } as UPDATE_AOE_VARIABLES,
          },
          result: {
            data: {
              updateTimeOfTestQuestions: null,
            } as UPDATE_AOE_DATA,
          },
        },
        {
          request: {
            query: UPDATE_AOE,
            variables: {
              patientId: testOrderInfo.patient.internalId,
              symptoms:
                '{"25064002":false,"36955009":false,"43724002":false,"44169009":false,"49727002":false,"62315008":false,"64531003":false,"68235000":false,"68962001":false,"84229001":false,"103001002":false,"162397003":false,"230145002":false,"267036007":false,"422400008":false,"422587007":false,"426000000":false}',
              symptomOnset: "2023-08-15",
              noSymptoms: false,
              genderOfSexualPartners: null,
            } as UPDATE_AOE_VARIABLES,
          },
          result: {
            data: {
              updateTimeOfTestQuestions: null,
            } as UPDATE_AOE_DATA,
          },
        },
      ];

      const { user } = await renderQueueItem({ mocks });

      await user.click(
        within(
          screen.getByTestId(`has-any-symptoms-${testOrderInfo.internalId}`)
        ).getByLabelText("Yes")
      );
      await waitFor(() =>
        expect(
          within(
            screen.getByTestId(`has-any-symptoms-${testOrderInfo.internalId}`)
          ).getByLabelText("Yes")
        ).toBeChecked()
      );

      await user.type(screen.getByTestId("symptom-date"), "2023-08-15");
      await waitFor(() =>
        expect(screen.getByTestId("symptom-date")).toHaveValue("2023-08-15")
      );

      expect(trackEventMock).toHaveBeenCalledWith({
        name: "Update AoE Response",
      });
    });
  });

  describe("on device specimen type change", () => {
    it("updates test order on device type and specimen type change", async () => {
      const mocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: testOrderInfo.internalId,
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
              id: testOrderInfo.internalId,
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
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: testOrderInfo.internalId,
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

      const { user } = await renderQueueItem({ mocks });

      const deviceDropdown = await getDeviceTypeDropdown();
      expect(deviceDropdown.options.length).toEqual(
        DEFAULT_DEVICE_OPTIONS_LENGTH
      );
      expectDeviceOrder(deviceDropdown, DEFAULT_DEVICE_ORDER);

      // select results
      await user.click(screen.getByLabelText("Positive", { exact: false }));

      // Change device type
      await user.selectOptions(deviceDropdown, device3Name);

      // Change specimen type
      const swabDropdown = await getSpecimenTypeDropdown();
      expect(swabDropdown.options.length).toEqual(2);
      expect(swabDropdown.options[0].label).toEqual("Nasopharyngeal swab");
      expect(swabDropdown.options[1].label).toEqual("Swab of internal nose");

      await user.selectOptions(swabDropdown, specimen2Name);

      expect(deviceDropdown.value).toEqual(device3Id);
      expect(swabDropdown.value).toEqual(specimen2Id);
    });

    it("adds radio buttons for Flu A and Flu B when a multiplex device is chosen", async () => {
      const mocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: testOrderInfo.internalId,
              deviceTypeId: device4Id,
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
                  internalId: device4Id,
                  testLength: 10,
                },
              },
            } as EDIT_QUEUE_ITEM_DATA,
          },
        },
      ];

      const { user } = await renderQueueItem({ mocks });

      expect(screen.queryByText("Flu A result")).not.toBeInTheDocument();
      expect(screen.queryByText("Flu B result")).not.toBeInTheDocument();

      const deviceDropdown = await getDeviceTypeDropdown();
      expect(deviceDropdown.options.length).toEqual(
        DEFAULT_DEVICE_OPTIONS_LENGTH
      );
      expectDeviceOrder(deviceDropdown, DEFAULT_DEVICE_ORDER);

      // Change device type to a multiplex device
      await user.selectOptions(deviceDropdown, device4Name);

      expect(screen.getByText("Flu A result")).toBeInTheDocument();
      expect(screen.getByText("Flu B result")).toBeInTheDocument();
    });

    it("shows radio buttons for HIV when an HIV device is chosen", async function () {
      mockDiseaseEnabledFlag("HIV");

      const mocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: testOrderInfo.internalId,
              deviceTypeId: device7Id,
              specimenTypeId: specimen3Id,
              results: [{ diseaseName: "HIV", testResult: "POSITIVE" }],
              dateTested: null,
            } as EDIT_QUEUE_ITEM_VARIABLES,
          },
          result: {
            data: {
              editQueueItem: {
                results: [
                  {
                    disease: { name: "HIV" },
                    testResult: "POSITIVE",
                  },
                ],
                dateTested: null,
                deviceType: {
                  internalId: device7Id,
                  testLength: 15,
                },
              },
            } as EDIT_QUEUE_ITEM_DATA,
          },
        },
      ];

      const { user } = await renderQueueItem({ mocks });
      expect(screen.queryByText("HIV result")).not.toBeInTheDocument();

      const deviceDropdown = await getDeviceTypeDropdown();
      expect(deviceDropdown.options.length).toEqual(
        DEFAULT_DEVICE_OPTIONS_LENGTH + 1
      );

      await user.selectOptions(deviceDropdown, device7Name);
      expect(screen.getByText("HIV result")).toBeInTheDocument();
    });

    it.only("shows required HIV AOE questions when a positive HIV result is present", async function () {
      mockDiseaseEnabledFlag("HIV");

      const mocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: testOrderInfo.internalId,
              deviceTypeId: device7Id,
              specimenTypeId: specimen3Id,
              results: [{ diseaseName: "HIV", testResult: "POSITIVE" }],
              dateTested: null,
            } as EDIT_QUEUE_ITEM_VARIABLES,
          },
          result: {
            data: {
              editQueueItem: {
                results: [
                  {
                    disease: { name: "HIV" },
                    testResult: "POSITIVE",
                  },
                ],
                dateTested: null,
                deviceType: {
                  internalId: device7Id,
                  testLength: 15,
                },
              },
            } as EDIT_QUEUE_ITEM_DATA,
          },
        },
      ];

      const { user } = await renderQueueItem({ mocks });
      const deviceDropdown = await getDeviceTypeDropdown();

      await user.selectOptions(deviceDropdown, device7Name);
      expect(screen.getByText("HIV result")).toBeInTheDocument();

      await user.click(
        screen.getByLabelText("Positive", {
          exact: false,
        })
      );
      expect(screen.getByText("Is the patient pregnant?")).toBeInTheDocument();
      expect(
        screen.getByText("What is the gender of their sexual partners?")
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          "Is the patient currently experiencing any symptoms?"
        )
      ).not.toBeInTheDocument();
    });

    it("hides AOE questions when there is no positive HIV result", async function () {
      mockDiseaseEnabledFlag("HIV");

      const mocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: testOrderInfo.internalId,
              deviceTypeId: device7Id,
              specimenTypeId: specimen3Id,
              results: [{ diseaseName: "HIV", testResult: "UNKNOWN" }],
              dateTested: null,
            } as EDIT_QUEUE_ITEM_VARIABLES,
          },
          result: {
            data: {
              editQueueItem: {
                results: [
                  {
                    disease: { name: "HIV" },
                    testResult: "UNKNOWN",
                  },
                ],
                dateTested: null,
                deviceType: {
                  internalId: device7Id,
                  testLength: 15,
                },
              },
            } as EDIT_QUEUE_ITEM_DATA,
          },
        },
      ];

      const { user } = await renderQueueItem({ mocks });
      const deviceDropdown = await getDeviceTypeDropdown();

      await user.selectOptions(deviceDropdown, device7Name);
      expect(screen.getByText("HIV result")).toBeInTheDocument();

      await user.click(
        screen.getByLabelText("Inconclusive", {
          exact: false,
        })
      );
      expect(
        screen.queryByText("Is the patient pregnant?")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("What is the gender of their sexual partners?")
      ).not.toBeInTheDocument();
    });

    it("should show no AOE questions when a flu only device is chosen", async function () {
      const mocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: testOrderInfo.internalId,
              deviceTypeId: device4Id,
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
                  internalId: device4Id,
                  testLength: 10,
                },
              },
            } as EDIT_QUEUE_ITEM_DATA,
          },
        },
      ];

      const { user } = await renderQueueItem({ mocks });

      const deviceDropdown = await getDeviceTypeDropdown();
      expect(deviceDropdown.options.length).toEqual(
        DEFAULT_DEVICE_OPTIONS_LENGTH
      );
      expectDeviceOrder(deviceDropdown, DEFAULT_DEVICE_ORDER);

      // Change device type to a flu only device
      await user.selectOptions(deviceDropdown, device6Name);

      expect(screen.getByText("Flu A result")).toBeInTheDocument();
      expect(screen.getByText("Flu A result")).toBeInTheDocument();
      expect(screen.queryByText("COVID result")).not.toBeInTheDocument();

      expect(
        screen.queryByText("Is the patient currently experiencing any symptoms")
      ).not.toBeInTheDocument();
    });
  });
});
