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
import SRToastContainer from "../../commonComponents/SRToastContainer";
import { TestCorrectionReason } from "../../testResults/viewResults/actionMenuModals/TestResultCorrectionModal";
import mockSupportedDiseaseCovid from "../mocks/mockSupportedDiseaseCovid";
import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../../testResults/constants";
import { ONSET_DATE_LABEL } from "../../../patientApp/timeOfTest/constants";
import { REQUIRED_AOE_QUESTIONS_BY_DISEASE } from "../TestCardForm/TestCardForm.utils";
import {
  positiveGenerateMockOne,
  firstCardSymptomUpdateMock,
  secondCardSymptomUpdateMock,
  positiveDeviceThreeEditMock,
  secondTestOrder,
  device3Id,
  device3Name,
  device1Name,
  device2Name,
  device4Name,
  device5Name,
  device6Name,
  testOrderInfo,
  DEFAULT_DEVICE_OPTIONS_LENGTH,
  deletedDeviceId,
  deletedDeviceName,
  device1Id,
  deletedSpecimenId,
  device2Id,
  specimen1Id,
  device4Id,
  device5Id,
  specimen2Name,
  specimen2Id,
  device7Name,
  device8Name,
  generateSubmitQueueMock,
  blankUpdateAoeEventMock,
  generateEditQueueMock,
  generateEmptyEditQueueMock,
  falseNoSymptomWithSymptomOnsetUpdateAoeMock,
  falseNoSymptomAoeMock,
  TEST_CARD_SYMPTOM_ONSET_DATE_STRING,
  updateSyphilisAoeMocks,
  sharedTestOrderInfo,
  BLURRED_VISION_LITERAL,
  specimen1Name,
  device6Id,
  device7Id,
  specimen3Name,
  specimen3Id,
  device8Id,
  device9Name,
  device9Id,
  NO_SYMPTOMS_FALSE_OVERRIDE,
  mutationResponse,
  updateHepCAoeMocks,
  baseStiAoeUpdateMock,
} from "../testCardTestConstants";
import { QueriedFacility } from "../TestCardForm/types";
import mockSupportedDiseaseMultiplex, {
  mockSupportedDiseaseFlu,
} from "../mocks/mockSupportedDiseaseMultiplex";
import mockSupportedDiseaseTestPerformedHIV from "../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedHIV";
import mockSupportedDiseaseTestPerformedSyphilis from "../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedSyphilis";
import { UpdateTestOrderTimerStartedAtDocument } from "../../../generated/graphql";
import mockSupportedDiseaseTestPerformedHepatitisC from "../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedHepatitisC";

import { TestCard, TestCardProps } from "./TestCard";

jest.mock("../../TelemetryService", () => ({
  getAppInsights: jest.fn(),
}));

const mockDiseaseEnabledFlag = (diseaseName: string) =>
  jest
    .spyOn(flaggedMock, "useFeature")
    .mockImplementation((flagName: string) => {
      return flagName === `${diseaseName}Enabled`;
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

const getDeviceTypeDropdown = async () =>
  (await screen.findByTestId("device-type-dropdown")) as HTMLSelectElement;

async function getSpecimenTypeDropdown() {
  return (await screen.findByTestId(
    "specimen-type-dropdown"
  )) as HTMLSelectElement;
}

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
      supportedDiseaseTestPerformed: [...mockSupportedDiseaseTestPerformedHIV],
      swabTypes: [
        {
          name: specimen3Name,
          internalId: specimen3Id,
          typeCode: "122555007",
        },
      ],
    },
    {
      internalId: device8Id,
      name: device8Name,
      testLength: 15,
      supportedDiseaseTestPerformed: [
        ...mockSupportedDiseaseTestPerformedSyphilis,
      ],
      swabTypes: [
        {
          name: specimen3Name,
          internalId: specimen3Id,
          typeCode: "122555007",
        },
      ],
    },
    {
      internalId: device9Id,
      name: device9Name,
      testLength: 15,
      supportedDiseaseTestPerformed: [
        ...mockSupportedDiseaseTestPerformedHepatitisC,
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
export const devicesMap = new Map();
facilityInfo.deviceTypes.map((d) => devicesMap.set(d.internalId, d));

describe("TestCard", () => {
  let nowFn = Date.now;
  let store: MockStoreEnhanced<unknown, unknown>;
  let alertSpy: jest.SpyInstance;
  const mockStore = configureStore([]);
  const trackEventMock = jest.fn();
  const removePatientFromQueueMock = jest.fn();
  const trackMetricMock = jest.fn();
  const trackExceptionMock = jest.fn();

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
    const renderProps = props || testProps;

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
              refetchQueue={renderProps.refetchQueue}
              testOrder={renderProps.testOrder}
              startTestPatientId={renderProps.startTestPatientId}
              setStartTestPatientId={renderProps.setStartTestPatientId}
              facility={renderProps.facility}
              devicesMap={renderProps.devicesMap}
              removePatientFromQueue={renderProps.removePatientFromQueue}
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

  it("updates the test order timer started at value when the timer is clicked", async () => {
    const currentTime = Date.now();
    const props = { ...testProps };
    props.testOrder.timerStartedAt = currentTime.toString();
    const { user } = await renderQueueItem({
      props: props,
      mocks: [
        {
          request: {
            query: UpdateTestOrderTimerStartedAtDocument,
            variables: { testOrderId: props.testOrder.internalId },
          },
          result: { data: { updateTestOrderTimerStartedAt: null } },
        },
      ],
    });

    const timerButton = await screen.findByTestId("timer");
    expect(timerButton).toHaveTextContent("15:00");

    await user.click(timerButton);
    expect(timerButton).toHaveTextContent("Start timer");
  });

  it("handles a null timer started at value", async () => {
    const currentTime = Date.now();
    global.Date.now = jest.fn(() => new Date(currentTime).getTime());
    const props = { ...testProps };
    props.testOrder.timerStartedAt = null;
    const { user } = await renderQueueItem({
      props: props,
      mocks: [
        {
          request: {
            query: UpdateTestOrderTimerStartedAtDocument,
            variables: {
              testOrderId: props.testOrder.internalId,
              startedAt: currentTime.toString(),
            },
          },
          result: { data: { updateTestOrderTimerStartedAt: null } },
        },
        {
          request: {
            query: UpdateTestOrderTimerStartedAtDocument,
            variables: { testOrderId: props.testOrder.internalId },
          },
          result: { data: { updateTestOrderTimerStartedAt: null } },
        },
      ],
    });

    const timerButton = await screen.findByTestId("timer");
    expect(timerButton).toHaveTextContent("Start timer");

    await user.click(timerButton);
    expect(timerButton).toHaveTextContent("15:00");

    await user.click(timerButton);
    expect(timerButton).toHaveTextContent("Start timer");
    global.Date.now = Date.now;
  });

  it("renders dropdown of device types", async () => {
    const { user } = await renderQueueItem({
      mocks: [blankUpdateAoeEventMock],
    });

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
        generateEditQueueMock(
          MULTIPLEX_DISEASES.COVID_19,
          TEST_RESULTS.POSITIVE,
          {
            device: {
              deviceId: deletedDeviceId,
              deviceName: deletedDeviceName,
            },
          }
        ),
        generateEditQueueMock(
          MULTIPLEX_DISEASES.COVID_19,
          TEST_RESULTS.POSITIVE,
          {
            device: {
              deviceId: device1Id,
              deviceName: device1Name,
            },
          }
        ),
        blankUpdateAoeEventMock,
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
        generateEditQueueMock(
          MULTIPLEX_DISEASES.COVID_19,
          TEST_RESULTS.POSITIVE,
          {
            specimen: {
              specimenId: deletedSpecimenId,
              specimenName: deletedDeviceName,
            },
          }
        ),
        generateEditQueueMock(
          MULTIPLEX_DISEASES.COVID_19,
          TEST_RESULTS.POSITIVE
        ),
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
        generateEditQueueMock(
          MULTIPLEX_DISEASES.COVID_19,
          TEST_RESULTS.UNDETERMINED
        ),
        generateSubmitQueueMock(
          MULTIPLEX_DISEASES.COVID_19,
          TEST_RESULTS.UNDETERMINED,
          {
            deliverySuccess: false,
          }
        ),
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
    const { user } = await renderQueueItem({
      mocks: [
        generateEmptyEditQueueMock({
          dateTested: new Date().toISOString(),
        }),
      ],
    });
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
        generateEmptyEditQueueMock(),
        generateEditQueueMock(
          MULTIPLEX_DISEASES.COVID_19,
          TEST_RESULTS.POSITIVE,
          {
            device: {
              deviceId: device4Id,
              deviceName: device4Name,
            },
          }
        ),
        blankUpdateAoeEventMock,
        blankUpdateAoeEventMock,
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
        generateEditQueueMock(
          MULTIPLEX_DISEASES.COVID_19,
          TEST_RESULTS.UNDETERMINED
        ),
        generateSubmitQueueMock(
          MULTIPLEX_DISEASES.COVID_19,
          TEST_RESULTS.UNDETERMINED
        ),
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
        falseNoSymptomWithSymptomOnsetUpdateAoeMock,
        falseNoSymptomAoeMock,
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

      const symptomDateInput = within(
        screen.getByTestId("symptom-date")
      ).getByLabelText(ONSET_DATE_LABEL);

      await user.type(symptomDateInput, TEST_CARD_SYMPTOM_ONSET_DATE_STRING);
      await waitFor(() =>
        expect(symptomDateInput).toHaveValue(
          TEST_CARD_SYMPTOM_ONSET_DATE_STRING
        )
      );

      expect(trackEventMock).toHaveBeenCalledWith({
        name: "Update AoE Response",
      });
    });
  });

  describe("on device specimen type change", () => {
    it("updates test order on device type and specimen type change", async () => {
      const mocks = [
        generateEditQueueMock(
          MULTIPLEX_DISEASES.COVID_19,
          TEST_RESULTS.POSITIVE
        ),
        generateEditQueueMock(
          MULTIPLEX_DISEASES.COVID_19,
          TEST_RESULTS.POSITIVE,
          {
            device: {
              deviceId: device3Id,
              supportedDiseases: [
                {
                  internalId: "6e67ea1c-f9e8-4b3f-8183-b65383ac1283",
                  loinc: "96741-4",
                  name: MULTIPLEX_DISEASES.COVID_19,
                },
                {
                  internalId: "e286f2a8-38e2-445b-80a5-c16507a96b66",
                  loinc: "LP14239-5",
                  name: MULTIPLEX_DISEASES.FLU_A,
                },
                {
                  internalId: "14924488-268f-47db-bea6-aa706971a098",
                  loinc: "LP14240-3",
                  name: MULTIPLEX_DISEASES.FLU_B,
                },
              ],
            },
          }
        ),
        blankUpdateAoeEventMock,
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
        generateEditQueueMock(
          MULTIPLEX_DISEASES.COVID_19,
          TEST_RESULTS.POSITIVE
        ),
        blankUpdateAoeEventMock,
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

    it("should show no AOE questions when a flu only device is chosen", async function () {
      const mocks = [
        generateEditQueueMock(
          MULTIPLEX_DISEASES.COVID_19,
          TEST_RESULTS.POSITIVE
        ),
        blankUpdateAoeEventMock,
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

    it("shows radio buttons for HIV when an HIV device is chosen", async function () {
      mockDiseaseEnabledFlag("hiv");

      const mocks = [
        generateEditQueueMock(MULTIPLEX_DISEASES.HIV, TEST_RESULTS.POSITIVE),
        blankUpdateAoeEventMock,
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

    it("shows required HIV AOE questions when a positive HIV result is present", async function () {
      mockDiseaseEnabledFlag("hiv");

      const mocks = [
        generateEditQueueMock(MULTIPLEX_DISEASES.HIV, TEST_RESULTS.POSITIVE),
        blankUpdateAoeEventMock,
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
          "Is the patient currently experiencing or showing signs of symptoms?"
        )
      ).not.toBeInTheDocument();
    });

    it("hides AOE questions when there is no positive HIV result", async function () {
      mockDiseaseEnabledFlag("hiv");

      const mocks = [
        generateEditQueueMock(MULTIPLEX_DISEASES.HIV, TEST_RESULTS.UNKNOWN),
        blankUpdateAoeEventMock,
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

    it("shows radio buttons for Syphilis when a syphilis device is chosen", async function () {
      mockDiseaseEnabledFlag("syphilis");

      const mocks = [
        generateEditQueueMock(
          MULTIPLEX_DISEASES.SYPHILIS,
          TEST_RESULTS.POSITIVE
        ),
        blankUpdateAoeEventMock,
      ];

      const { user } = await renderQueueItem({ mocks });
      expect(screen.queryByText("Syphilis result")).not.toBeInTheDocument();

      const deviceDropdown = await getDeviceTypeDropdown();

      await user.selectOptions(deviceDropdown, device8Name);
      expect(screen.getByText("Syphilis result")).toBeInTheDocument();
    });

    it("shows required syphilis AOE questions when a positive syphilis result is present", async function () {
      mockDiseaseEnabledFlag("syphilis");

      const mocks = [
        generateEditQueueMock(
          MULTIPLEX_DISEASES.SYPHILIS,
          TEST_RESULTS.POSITIVE
        ),
        blankUpdateAoeEventMock,
      ];

      const { user } = await renderQueueItem({ mocks });
      const deviceDropdown = await getDeviceTypeDropdown();
      expect(deviceDropdown.options.length).toEqual(
        DEFAULT_DEVICE_OPTIONS_LENGTH + 1
      );

      await user.selectOptions(deviceDropdown, device8Name);
      expect(screen.getByText("Syphilis result")).toBeInTheDocument();

      await user.click(
        screen.getByLabelText("Positive", {
          exact: false,
        })
      );

      expect(screen.getByText("Is the patient pregnant?")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Is the patient currently experiencing or showing signs of symptoms?"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText("What is the gender of their sexual partners?")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Has the patient been told they have syphilis before?")
      ).toBeInTheDocument();
    });

    it("hides AOE questions when there is no positive syphilis result", async function () {
      mockDiseaseEnabledFlag("syphilis");

      const mocks = [
        generateEditQueueMock(
          MULTIPLEX_DISEASES.SYPHILIS,
          TEST_RESULTS.POSITIVE
        ),
        blankUpdateAoeEventMock,
      ];

      const { user } = await renderQueueItem({ mocks });
      const deviceDropdown = await getDeviceTypeDropdown();

      await user.selectOptions(deviceDropdown, device8Name);
      expect(screen.getByText("Syphilis result")).toBeInTheDocument();
      expect(
        screen.queryByText("Is the patient pregnant?")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          "Is the patient currently experiencing or showing signs of symptoms?"
        )
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("What is the gender of their sexual partners?")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          "Has the patient been told they have syphilis before?"
        )
      ).not.toBeInTheDocument();

      await user.click(
        screen.getByLabelText("Inconclusive", {
          exact: false,
        })
      );
      expect(
        screen.queryByText("Is the patient pregnant?")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          "Is the patient currently experiencing or showing signs of symptoms?"
        )
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("What is the gender of their sexual partners?")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          "Has the patient been told they have syphilis before?"
        )
      ).not.toBeInTheDocument();
    });

    it("shows radio buttons for Hepatitis C when a hepatitis c device is chosen", async function () {
      mockDiseaseEnabledFlag("hepatitisC");

      const mocks = [
        generateEditQueueMock(
          MULTIPLEX_DISEASES.HEPATITIS_C,
          TEST_RESULTS.POSITIVE
        ),
        blankUpdateAoeEventMock,
      ];

      const { user } = await renderQueueItem({ mocks });
      expect(screen.queryByText("Hepatitis C result")).not.toBeInTheDocument();

      const deviceDropdown = await getDeviceTypeDropdown();

      await user.selectOptions(deviceDropdown, device9Name);
      expect(screen.getByText("Hepatitis C result")).toBeInTheDocument();
    });

    it("shows required Hepatitis C AOE questions when a positive Hepatitis C result is present", async function () {
      mockDiseaseEnabledFlag("hepatitisC");

      const mocks = [
        generateEditQueueMock(
          MULTIPLEX_DISEASES.HEPATITIS_C,
          TEST_RESULTS.POSITIVE
        ),
        blankUpdateAoeEventMock,
        {
          ...baseStiAoeUpdateMock({
            ...NO_SYMPTOMS_FALSE_OVERRIDE,
          }),
          ...mutationResponse,
        },
      ];

      const { user } = await renderQueueItem({ mocks });
      const deviceDropdown = await getDeviceTypeDropdown();
      expect(deviceDropdown.options.length).toEqual(
        DEFAULT_DEVICE_OPTIONS_LENGTH + 1
      );

      await user.selectOptions(deviceDropdown, device9Name);
      expect(screen.getByText("Hepatitis C result")).toBeInTheDocument();

      await user.click(
        screen.getByLabelText("Positive", {
          exact: false,
        })
      );

      expect(screen.getByText("Is the patient pregnant?")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Is the patient currently experiencing or showing signs of symptoms?"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText("What is the gender of their sexual partners?")
      ).toBeInTheDocument();

      const symptomFieldSet = screen.getByTestId(
        `has-any-symptoms-${sharedTestOrderInfo.internalId}`
      );
      await user.click(within(symptomFieldSet).getByLabelText("Yes"));

      expect(
        screen.getByText("Select any symptoms the patient is experiencing")
      ).toBeInTheDocument();
    });

    it("hides AOE questions when there is no positive Hepatitis C result", async function () {
      mockDiseaseEnabledFlag("hepatitisC");

      const mocks = [
        generateEditQueueMock(
          MULTIPLEX_DISEASES.HEPATITIS_C,
          TEST_RESULTS.POSITIVE
        ),
        blankUpdateAoeEventMock,
      ];

      const { user } = await renderQueueItem({ mocks });
      const deviceDropdown = await getDeviceTypeDropdown();

      await user.selectOptions(deviceDropdown, device9Name);
      expect(screen.getByText("Hepatitis C result")).toBeInTheDocument();
      expect(
        screen.queryByText("Is the patient pregnant?")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          "Is the patient currently experiencing or showing signs of symptoms?"
        )
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("What is the gender of their sexual partners?")
      ).not.toBeInTheDocument();

      await user.click(
        screen.getByLabelText("Inconclusive", {
          exact: false,
        })
      );
      expect(
        screen.queryByText("Is the patient pregnant?")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          "Is the patient currently experiencing or showing signs of symptoms?"
        )
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("What is the gender of their sexual partners?")
      ).not.toBeInTheDocument();
    });

    it("checks that Hep C submission only works if AOE questions are valid", async function () {
      mockDiseaseEnabledFlag("hepatitisC");

      const { user } = await renderQueueItem({ mocks: updateHepCAoeMocks });
      const deviceDropdown = await getDeviceTypeDropdown();

      await user.selectOptions(deviceDropdown, device9Name);
      await user.click(
        screen.getByLabelText("Positive", {
          exact: false,
        })
      );
      await user.click(
        screen.getByText("Submit results", {
          exact: false,
        })
      );
      const AOE_ERROR_TEXT = "Please answer this required question.";

      const requiredQuestions = screen.getAllByText(AOE_ERROR_TEXT);
      expect(requiredQuestions.length).toEqual(
        REQUIRED_AOE_QUESTIONS_BY_DISEASE.HEPATITIS_C.length
      );

      const pregnancyFieldSet = screen.getByTestId(
        `pregnancy-${sharedTestOrderInfo.internalId}`
      );
      await user.click(within(pregnancyFieldSet).getByLabelText("Yes"));

      const symptomFieldSet = screen.getByTestId(
        `has-any-symptoms-${sharedTestOrderInfo.internalId}`
      );
      await user.click(within(symptomFieldSet).getByLabelText("No"));

      const genderSexualPartnersFieldSet = screen.getByTestId(
        `multi-select-option-list`
      );
      await user.click(
        within(genderSexualPartnersFieldSet).getByTestId(
          "multi-select-option-female"
        )
      );

      await user.click(
        screen.getByText("Submit results", {
          exact: false,
        })
      );
      expect(screen.queryByText(AOE_ERROR_TEXT)).not.toBeInTheDocument();
    });

    it("checks that submission only works if AOE questions are valid", async function () {
      mockDiseaseEnabledFlag("syphilis");

      const { user } = await renderQueueItem({ mocks: updateSyphilisAoeMocks });
      const deviceDropdown = await getDeviceTypeDropdown();

      await user.selectOptions(deviceDropdown, device8Name);
      await user.click(
        screen.getByLabelText("Positive", {
          exact: false,
        })
      );
      await user.click(
        screen.getByText("Submit results", {
          exact: false,
        })
      );
      const AOE_ERROR_TEXT = "Please answer this required question.";

      const requiredQuestions = screen.getAllByText(AOE_ERROR_TEXT);
      expect(requiredQuestions.length).toEqual(
        REQUIRED_AOE_QUESTIONS_BY_DISEASE.SYPHILIS.length
      );

      const historyFieldSet = screen.getByTestId(
        `syphilisHistory-${sharedTestOrderInfo.internalId}`
      );
      await user.click(within(historyFieldSet).getByLabelText("Yes"));

      await user.click(
        screen.getByText("Submit results", {
          exact: false,
        })
      );

      const pregnancyFieldSet = screen.getByTestId(
        `pregnancy-${sharedTestOrderInfo.internalId}`
      );
      await user.click(within(pregnancyFieldSet).getByLabelText("Yes"));

      const symptomFieldSet = screen.getByTestId(
        `has-any-symptoms-${sharedTestOrderInfo.internalId}`
      );
      await user.click(within(symptomFieldSet).getByLabelText("No"));

      const genderSexualPartnersFieldSet = screen.getByTestId(
        `multi-select-option-list`
      );
      await user.click(
        within(genderSexualPartnersFieldSet).getByTestId(
          "multi-select-option-female"
        )
      );

      await user.click(
        screen.getByText("Submit results", {
          exact: false,
        })
      );
      expect(screen.queryByText(AOE_ERROR_TEXT)).not.toBeInTheDocument();
    });

    it("checks that checking has symptom requires onset date and selection", async () => {
      mockDiseaseEnabledFlag("syphilis");
      const mocks = [...updateSyphilisAoeMocks];

      const { user } = await renderQueueItem({ mocks });
      const deviceDropdown = await getDeviceTypeDropdown();
      const AOE_ERROR_TEXT = "Please answer this required question.";

      await user.selectOptions(deviceDropdown, device8Name);

      await user.click(
        screen.getByLabelText("Positive", {
          exact: false,
        })
      );

      const historyFieldSet = screen.getByTestId(
        `syphilisHistory-${sharedTestOrderInfo.internalId}`
      );
      await user.click(within(historyFieldSet).getByLabelText("Yes"));

      const pregnancyFieldSet = screen.getByTestId(
        `pregnancy-${sharedTestOrderInfo.internalId}`
      );
      await user.click(within(pregnancyFieldSet).getByLabelText("Yes"));

      const genderSexualPartnersFieldSet = screen.getByTestId(
        `multi-select-option-list`
      );
      await user.click(
        within(genderSexualPartnersFieldSet).getByTestId(
          "multi-select-option-female"
        )
      );

      const symptomFieldSet = screen.getByTestId(
        `has-any-symptoms-${sharedTestOrderInfo.internalId}`
      );
      await user.click(within(symptomFieldSet).getByLabelText("Yes"));

      await user.click(
        screen.getByText("Submit results", {
          exact: false,
        })
      );

      const requiredQuestions = screen.getAllByText(AOE_ERROR_TEXT);
      expect(requiredQuestions.length).toEqual(2);

      await user.click(screen.getByText(BLURRED_VISION_LITERAL));
      await user.type(
        screen.getByTestId("symptom-date"),
        TEST_CARD_SYMPTOM_ONSET_DATE_STRING
      );

      await user.click(
        screen.getByText("Submit results", {
          exact: false,
        })
      );

      expect(screen.queryByText(AOE_ERROR_TEXT)).not.toBeInTheDocument();
    });
  });

  describe("regression test", () => {
    it("test card checkboxes don't conflict with each other", async () => {
      //   https://github.com/CDCgov/prime-simplereport/issues/7768
      const secondTestProps: TestCardProps = {
        ...testProps,
        testOrder: secondTestOrder,
      };

      const firstCardMocks = [
        falseNoSymptomAoeMock,
        firstCardSymptomUpdateMock,
        positiveGenerateMockOne,
      ];
      const { user } = await renderQueueItem({ mocks: firstCardMocks });

      const secondCardMocks = [
        falseNoSymptomAoeMock,
        secondCardSymptomUpdateMock,
        positiveDeviceThreeEditMock,
      ];

      await renderQueueItem({ props: secondTestProps, mocks: secondCardMocks });

      // set up test card one
      await user.click(
        within(
          screen.getByTestId(`COVID-19-test-result-${testOrderInfo.internalId}`)
        ).getByText("Positive", { exact: false })
      );

      await user.click(
        within(
          screen.getByTestId(`has-any-symptoms-${testOrderInfo.internalId}`)
        ).getByText("Yes", { exact: false })
      );

      const CHILLS_SNOMED_CODE = 43724002;
      const firstChillsCheckBox = screen.getByTestId(
        `symptoms-${testOrderInfo.internalId}-${CHILLS_SNOMED_CODE}`
      );
      await user.click(firstChillsCheckBox);

      // set up test card two
      await user.click(
        within(
          screen.getByTestId(
            `COVID-19-test-result-${secondTestOrder.internalId}`
          )
        ).getByText("Positive", { exact: false })
      );

      await user.click(
        within(
          screen.getByTestId(`has-any-symptoms-${secondTestOrder.internalId}`)
        ).getByText("Yes", { exact: false })
      );

      const secondChillsCheckBox = screen.getByTestId(
        `symptoms-${secondTestOrder.internalId}-${CHILLS_SNOMED_CODE}`
      );

      expect(secondChillsCheckBox).not.toBeChecked();
      await user.click(
        within(
          screen.getByTestId(`symptom-selection-${secondTestOrder.internalId}`)
        ).getByText("Chills", { exact: false })
      );
      expect(firstChillsCheckBox).toBeChecked();
    });
  });
});
