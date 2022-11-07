import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore, { MockStoreEnhanced } from "redux-mock-store";
import { render, screen, waitFor, within } from "@testing-library/react";
import moment from "moment";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import * as flaggedMock from "flagged";

import { getAppInsights } from "../TelemetryService";
import * as srToast from "../utils/srToast";
import { TestCorrectionReason } from "../testResults/TestResultCorrectionModal";
import {
  AddMultiplexResultDocument as SUBMIT_TEST_RESULT,
  EditQueueItemMultiplexResultDocument as EDIT_QUEUE_ITEM,
} from "../../generated/graphql";
import * as generatedGraphql from "../../generated/graphql";
import SRToastContainer from "../commonComponents/SRToastContainer";

import QueueItem from "./QueueItem";

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
const dateStringBeforeWarningThreshold = "2001-01-01";
const updatedTimeString = "10:05";

const setStartTestPatientIdMock = jest.fn();

describe("QueueItem", () => {
  let nowFn = Date.now;
  let store: MockStoreEnhanced<unknown, {}>;
  const mockStore = configureStore([]);
  const trackEventMock = jest.fn();

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
  });

  afterEach(() => {
    Date.now = nowFn;
    (getAppInsights as jest.Mock).mockReset();
    jest.spyOn(console, "error").mockRestore();
  });

  it("correctly renders the test queue", () => {
    render(
      <MemoryRouter>
        <MockedProvider>
          <Provider store={store}>
            <QueueItem
              internalId={testProps.internalId}
              patient={testProps.patient}
              askOnEntry={testProps.askOnEntry}
              selectedDeviceId={testProps.selectedDeviceId}
              selectedDeviceTestLength={testProps.selectedDeviceTestLength}
              selectedDeviceSpecimenTypeId={
                testProps.selectedDeviceSpecimenTypeId
              }
              deviceSpecimenTypes={testProps.deviceSpecimenTypes}
              selectedTestResults={testProps.selectedTestResults}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              facilityName="Foo facility"
              setStartTestPatientId={setStartTestPatientIdMock}
              startTestPatientId=""
            />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );
    expect(screen.getByText("Potter, Harry James")).toBeInTheDocument();
    expect(screen.getByTestId("timer")).toHaveTextContent("10:00");
  });

  it("scroll to patient and highlight when startTestPatientId is present", async () => {
    let scrollIntoViewMock = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    render(
      <MemoryRouter>
        <MockedProvider>
          <Provider store={store}>
            <QueueItem
              internalId={testProps.internalId}
              patient={testProps.patient}
              askOnEntry={testProps.askOnEntry}
              selectedDeviceId={testProps.selectedDeviceId}
              selectedDeviceTestLength={testProps.selectedDeviceTestLength}
              selectedDeviceSpecimenTypeId={
                testProps.selectedDeviceSpecimenTypeId
              }
              deviceSpecimenTypes={testProps.deviceSpecimenTypes}
              selectedTestResults={testProps.selectedTestResults}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              facilityName="Foo facility"
              setStartTestPatientId={setStartTestPatientIdMock}
              startTestPatientId={testProps.internalId}
            />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );

    const testCard = await screen.findByTestId(`test-card-${internalId}`);
    expect(testCard).toHaveClass("prime-queue-item__info");
    expect(testCard).toBeInTheDocument();
    expect(scrollIntoViewMock).toBeCalled();
  });

  it("navigates to edit the user when clicking their name", () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <Provider store={store}>
            <QueueItem
              internalId={testProps.internalId}
              patient={testProps.patient}
              askOnEntry={testProps.askOnEntry}
              selectedDeviceId={testProps.selectedDeviceId}
              selectedDeviceTestLength={testProps.selectedDeviceTestLength}
              selectedDeviceSpecimenTypeId={
                testProps.selectedDeviceSpecimenTypeId
              }
              deviceSpecimenTypes={testProps.deviceSpecimenTypes}
              selectedTestResults={testProps.selectedTestResults}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              facilityName="Foo facility"
              setStartTestPatientId={setStartTestPatientIdMock}
              startTestPatientId=""
            />
          </Provider>
        </MemoryRouter>
      </MockedProvider>
    );
    const patientName = screen.getByText("Potter, Harry James");
    expect(patientName).toBeInTheDocument();
    userEvent.click(patientName);
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: "/patient/f5c7658d-a0d5-4ec5-a1c9-eafc85fe7554",
      search: "?facility=Hogwarts+123&fromQueue=true",
    });
  });

  it("updates the timer when a device is changed", async () => {
    render(
      <MemoryRouter>
        <MockedProvider addTypename={false}>
          <Provider store={store}>
            <QueueItem
              internalId={testProps.internalId}
              patient={testProps.patient}
              askOnEntry={testProps.askOnEntry}
              selectedDeviceId={testProps.selectedDeviceId}
              selectedDeviceTestLength={testProps.selectedDeviceTestLength}
              selectedDeviceSpecimenTypeId={
                testProps.selectedDeviceSpecimenTypeId
              }
              deviceSpecimenTypes={testProps.deviceSpecimenTypes}
              selectedTestResults={testProps.selectedTestResults}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              facilityName="Foo facility"
              setStartTestPatientId={setStartTestPatientIdMock}
              startTestPatientId=""
            />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );

    userEvent.type(
      screen.getAllByLabelText("Device", { exact: false })[1],
      "lumira"
    );

    expect(await screen.findByTestId("timer")).toHaveTextContent("10:00");
  });

  it("renders dropdown of device types", async () => {
    render(
      <MemoryRouter>
        <MockedProvider addTypename={false}>
          <Provider store={store}>
            <QueueItem
              internalId={testProps.internalId}
              patient={testProps.patient}
              askOnEntry={testProps.askOnEntry}
              selectedDeviceId={testProps.selectedDeviceId}
              selectedDeviceTestLength={testProps.selectedDeviceTestLength}
              selectedDeviceSpecimenTypeId={
                testProps.selectedDeviceSpecimenTypeId
              }
              deviceSpecimenTypes={testProps.deviceSpecimenTypes}
              selectedTestResults={testProps.selectedTestResults}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              facilityName="Foo facility"
              setStartTestPatientId={setStartTestPatientIdMock}
              startTestPatientId=""
            />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );

    const deviceDropdown = (
      await screen.findAllByLabelText("Device", { exact: false })
    )[1];

    userEvent.selectOptions(deviceDropdown, "Access Bio CareStart");

    expect(
      ((await screen.findByText("Access Bio CareStart")) as HTMLOptionElement)
        .selected
    ).toBeTruthy();
    expect(
      ((await screen.findByText("LumiraDX")) as HTMLOptionElement).selected
    ).toBeFalsy();
  });

  it("renders dropdown of swab types configured with selected device", async () => {
    render(
      <MemoryRouter>
        <MockedProvider addTypename={false}>
          <Provider store={store}>
            <QueueItem
              internalId={testProps.internalId}
              patient={testProps.patient}
              askOnEntry={testProps.askOnEntry}
              selectedDeviceId={testProps.selectedDeviceId}
              selectedDeviceTestLength={testProps.selectedDeviceTestLength}
              selectedDeviceSpecimenTypeId={
                testProps.selectedDeviceSpecimenTypeId
              }
              deviceSpecimenTypes={testProps.deviceSpecimenTypes}
              selectedTestResults={testProps.selectedTestResults}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              facilityName="Foo facility"
              setStartTestPatientId={setStartTestPatientIdMock}
              startTestPatientId=""
            />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );
    const swabDropdown = await screen.findByLabelText("Swab type");

    // First device is selected
    expect(
      ((await screen.findByText("Access Bio CareStart")) as HTMLOptionElement)
        .selected
    ).toBeTruthy();

    userEvent.selectOptions(swabDropdown, "specimen-1");

    expect(
      ((await screen.findByText("Specimen 1")) as HTMLOptionElement).selected
    ).toBeTruthy();

    // Configured on the other device - should not appear in dropdown
    expect(
      screen.queryByText("Specimen 2") as HTMLOptionElement
    ).not.toBeInTheDocument();
  });

  describe("on device specimen type change", () => {
    let editQueueMockIsDone = false;
    beforeEach(() => {
      editQueueMockIsDone = false;

      const editQueueMocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: internalId,
              deviceSpecimenType: "device-specimen-2",
              deviceId: "lumira",
              results: [{ diseaseName: "COVID-19", testResult: "POSITIVE" }],
            },
          },
          result: () => {
            editQueueMockIsDone = true;

            return {
              data: {
                editQueueItemMultiplexResult: {
                  results: [
                    {
                      disease: { name: "COVID-19" },
                      testResult: "POSITIVE",
                    },
                  ],
                  dateTested: null,
                  deviceType: {
                    internalId: internalId,
                    testLength: 10,
                  },
                  deviceSpecimenType: {
                    internalId: "device-specimen-2",
                    deviceType: deviceTwo,
                    specimenType: {},
                  },
                },
              },
            };
          },
        },
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: internalId,
              deviceSpecimenType: "device-specimen-3",
              deviceId: "multiplex",
              results: [{ diseaseName: "COVID-19", testResult: "POSITIVE" }],
            },
          },
          result: () => {
            editQueueMockIsDone = true;

            return {
              data: {
                editQueueItemMultiplexResult: {
                  results: [
                    {
                      disease: { name: "COVID-19" },
                      testResult: "POSITIVE",
                    },
                  ],
                  dateTested: null,
                  deviceType: {
                    internalId: internalId,
                    testLength: 10,
                  },
                  deviceSpecimenType: {
                    internalId: "device-specimen-3",
                    deviceType: deviceThree,
                    specimenType: {},
                  },
                },
              },
            };
          },
        },
      ];

      render(
        <>
          <MemoryRouter>
            <MockedProvider mocks={editQueueMocks} addTypename={false}>
              <Provider store={store}>
                <QueueItem
                  internalId={testProps.internalId}
                  patient={testProps.patient}
                  askOnEntry={testProps.askOnEntry}
                  selectedDeviceId={testProps.selectedDeviceId}
                  selectedDeviceTestLength={testProps.selectedDeviceTestLength}
                  selectedDeviceSpecimenTypeId={
                    testProps.selectedDeviceSpecimenTypeId
                  }
                  deviceSpecimenTypes={testProps.deviceSpecimenTypes}
                  selectedTestResults={[
                    {
                      disease: { name: "COVID-19" },
                      testResult: "POSITIVE",
                    },
                  ]}
                  devices={testProps.devices}
                  refetchQueue={testProps.refetchQueue}
                  facilityId={testProps.facilityId}
                  dateTestedProp={testProps.dateTestedProp}
                  facilityName="Foo facility"
                  setStartTestPatientId={setStartTestPatientIdMock}
                  startTestPatientId=""
                />
              </Provider>
            </MockedProvider>
          </MemoryRouter>
          <SRToastContainer />
        </>
      );
    });
    it("updates test order on device specimen type change", async () => {
      const deviceDropdown = (
        await screen.findAllByLabelText("Device", { exact: false })
      )[1];

      // Change device type
      userEvent.selectOptions(deviceDropdown, "LumiraDX");
      userEvent.click(screen.getByLabelText("Positive", { exact: false }));

      await waitFor(() => expect(editQueueMockIsDone).toBe(true));
    });
    it("adds radio buttons for Flu A and Flu B when a multiplex device is chosen", async () => {
      jest.spyOn(flaggedMock, "useFeature").mockReturnValue(true);

      expect(screen.queryByText("Flu A")).not.toBeInTheDocument();
      expect(screen.queryByText("Flu B")).not.toBeInTheDocument();
      const deviceDropdown = (
        await screen.findAllByLabelText("Device", { exact: false })
      )[1];

      // Change device type
      userEvent.selectOptions(deviceDropdown, "MultiplexMate");
      userEvent.click(
        screen.getAllByLabelText("Positive", { exact: false })[0]
      );

      await waitFor(() => expect(editQueueMockIsDone).toBe(true));

      expect(await screen.findByText("Flu A")).toBeInTheDocument();
      expect(await screen.findByText("Flu B")).toBeInTheDocument();

      jest.resetAllMocks();
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
      let submitTestMockIsDone = false;

      const submitTestResultMocks = [
        {
          request: {
            query: SUBMIT_TEST_RESULT,
            variables: {
              patientId: internalId,
              deviceId: internalId,
              deviceSpecimenType: "device-specimen-1",
              results: [
                { diseaseName: "COVID-19", testResult: "UNDETERMINED" },
              ],
              dateTested: null,
            },
          },
          result: () => {
            submitTestMockIsDone = true;
            return {
              data: {
                addMultiplexResult: {
                  testResult: {
                    internalId: internalId,
                  },
                  deliverySuccess: false,
                },
              },
            };
          },
        },
      ];

      render(
        <>
          <MemoryRouter>
            <MockedProvider mocks={submitTestResultMocks} addTypename={false}>
              <Provider store={store}>
                <QueueItem
                  internalId={testProps.internalId}
                  patient={testProps.patient}
                  askOnEntry={testProps.askOnEntry}
                  selectedDeviceId={testProps.selectedDeviceId}
                  selectedDeviceTestLength={testProps.selectedDeviceTestLength}
                  selectedDeviceSpecimenTypeId={
                    testProps.selectedDeviceSpecimenTypeId
                  }
                  deviceSpecimenTypes={testProps.deviceSpecimenTypes}
                  selectedTestResults={[
                    {
                      disease: { name: "COVID-19" },
                      testResult: "UNDETERMINED",
                    },
                  ]}
                  devices={testProps.devices}
                  refetchQueue={testProps.refetchQueue}
                  facilityId={testProps.facilityId}
                  dateTestedProp={testProps.dateTestedProp}
                  facilityName="Foo facility"
                  setStartTestPatientId={setStartTestPatientIdMock}
                  startTestPatientId=""
                />
              </Provider>
            </MockedProvider>
          </MemoryRouter>
          <SRToastContainer />
        </>
      );

      // Select result
      userEvent.click(
        screen.getByLabelText("Inconclusive", {
          exact: false,
        })
      );

      // Wait for the genuinely long-running "edit queue" operation to finish
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Submit
      userEvent.click(screen.getByText("Submit"));

      userEvent.click(
        screen.getByText("Submit anyway", {
          exact: false,
        })
      );

      // Displays submitting indicator
      expect(
        await screen.findByText(
          "Submitting test data for Potter, Harry James..."
        )
      ).toBeInTheDocument();

      // Wait for MockedProvider to populate the mocked result
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(submitTestMockIsDone).toBe(true);

      // Verify alert is displayed
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          "The phone number provided may not be valid or may not be able to accept text messages",
          "Unable to text result to Potter, Harry James"
        );
      });
      expect(
        await screen.findByText(
          "Unable to text result to Potter, Harry James",
          {
            exact: false,
          }
        )
      ).toBeInTheDocument();

      // Submitting indicator and card are gone
      expect(
        await screen.findByText("Potter, Harry James")
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          "Submitting test data for Potter, Harry James..."
        )
      ).toBeInTheDocument();
    });
  });

  it("updates custom test date/time", async () => {
    render(
      <MemoryRouter>
        <MockedProvider addTypename={false}>
          <Provider store={store}>
            <QueueItem
              internalId={testProps.internalId}
              patient={testProps.patient}
              askOnEntry={testProps.askOnEntry}
              selectedDeviceId={testProps.selectedDeviceId}
              selectedDeviceTestLength={testProps.selectedDeviceTestLength}
              selectedDeviceSpecimenTypeId={
                testProps.selectedDeviceSpecimenTypeId
              }
              deviceSpecimenTypes={testProps.deviceSpecimenTypes}
              selectedTestResults={testProps.selectedTestResults}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              facilityName="Foo facility"
              setStartTestPatientId={setStartTestPatientIdMock}
              startTestPatientId=""
            />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );
    const toggle = await screen.findByLabelText("Current date/time");
    userEvent.click(toggle);
    const dateInput = screen.getByTestId("test-date");
    expect(dateInput).toBeInTheDocument();
    const timeInput = screen.getByTestId("test-time");
    expect(timeInput).toBeInTheDocument();
    userEvent.type(dateInput, `${updatedDateString}T00:00`);
    userEvent.type(timeInput, updatedTimeString);
  });
  it("does not allow future date for test date", async () => {
    render(
      <>
        <MemoryRouter>
          <MockedProvider addTypename={false}>
            <Provider store={store}>
              <QueueItem
                internalId={testProps.internalId}
                patient={testProps.patient}
                askOnEntry={testProps.askOnEntry}
                selectedDeviceId={testProps.selectedDeviceId}
                selectedDeviceTestLength={testProps.selectedDeviceTestLength}
                selectedDeviceSpecimenTypeId={
                  testProps.selectedDeviceSpecimenTypeId
                }
                deviceSpecimenTypes={testProps.deviceSpecimenTypes}
                selectedTestResults={[
                  { disease: { name: "COVID-19" }, testResult: "UNDETERMINED" },
                ]}
                devices={testProps.devices}
                refetchQueue={testProps.refetchQueue}
                facilityId={testProps.facilityId}
                dateTestedProp={testProps.dateTestedProp}
                facilityName="Foo facility"
                setStartTestPatientId={setStartTestPatientIdMock}
                startTestPatientId=""
              />
            </Provider>
          </MockedProvider>
        </MemoryRouter>
        <SRToastContainer />
      </>
    );

    const toggle = await screen.findByLabelText("Current date/time");
    userEvent.click(toggle);
    const dateInput = screen.getByTestId("test-date");
    expect(dateInput).toBeInTheDocument();
    const timeInput = screen.getByTestId("test-time");
    expect(timeInput).toBeInTheDocument();

    // Select result
    userEvent.click(
      screen.getByLabelText("Inconclusive", {
        exact: false,
      })
    );

    // There is a 500ms debounce on queue item update operations
    await new Promise((resolve) => setTimeout(resolve, 501));

    // Input invalid (future date) - can't submit
    userEvent.type(dateInput, moment().add(5, "days").format("YYYY-MM-DD"));
    dateInput.blur();

    // 500ms debounce on queue item update operations
    await new Promise((resolve) => setTimeout(resolve, 501));

    // Submit test
    userEvent.click(await screen.findByText("Submit"));

    // Toast alert should appear
    await waitFor(async () => {
      expect(await screen.findByText("Invalid test date")).toBeInTheDocument();
    });
  });

  it("formats card with warning state if selected date input is more than six months ago", async () => {
    render(
      <MemoryRouter>
        <MockedProvider addTypename={false}>
          <Provider store={store}>
            <QueueItem
              internalId={testProps.internalId}
              patient={testProps.patient}
              askOnEntry={testProps.askOnEntry}
              selectedDeviceId={testProps.selectedDeviceId}
              selectedDeviceTestLength={testProps.selectedDeviceTestLength}
              selectedDeviceSpecimenTypeId={
                testProps.selectedDeviceSpecimenTypeId
              }
              deviceSpecimenTypes={testProps.deviceSpecimenTypes}
              selectedTestResults={testProps.selectedTestResults}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              facilityName="Foo facility"
              setStartTestPatientId={setStartTestPatientIdMock}
              startTestPatientId=""
            />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );
    const dateInput = screen.getByTestId("test-date");
    const timeInput = screen.getByTestId("test-time");

    userEvent.type(dateInput, `${dateStringBeforeWarningThreshold}T00:00`);
    const testCard = await screen.findByTestId(`test-card-${internalId}`);

    expect(testCard).toHaveClass("prime-queue-item__ready");
    expect(dateInput).toHaveClass("card-correction-input");
    expect(timeInput).toHaveClass("card-correction-input");
    expect(screen.getByTestId("test-correction-header")).toBeInTheDocument();
  });

  it("highlights the test card where the validation failure occurs", async () => {
    render(
      <MemoryRouter>
        <MockedProvider>
          <Provider store={store}>
            <QueueItem
              internalId={testProps.internalId}
              patient={testProps.patient}
              askOnEntry={testProps.askOnEntry}
              selectedDeviceId={testProps.selectedDeviceId}
              selectedDeviceTestLength={testProps.selectedDeviceTestLength}
              selectedDeviceSpecimenTypeId={
                testProps.selectedDeviceSpecimenTypeId
              }
              deviceSpecimenTypes={testProps.deviceSpecimenTypes}
              selectedTestResults={[
                { disease: { name: "COVID-19" }, testResult: "UNDETERMINED" },
              ]}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              facilityName="Foo facility"
              setStartTestPatientId={setStartTestPatientIdMock}
              startTestPatientId=""
            />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );

    // Enter an invalid (future) date on the first test card
    const toggle = await screen.findByLabelText("Current date/time");
    userEvent.click(toggle);
    const dateInput = await screen.findByTestId("test-date");
    expect(dateInput).toBeInTheDocument();
    userEvent.type(dateInput, moment().add(5, "days").format("YYYY-MM-DD"));
    dateInput.blur();

    await waitFor(async () =>
      expect(await screen.findByText("Submit")).toBeEnabled()
    );

    userEvent.click(await screen.findByText("Submit"));

    const updatedTestCard = await screen.findByTestId(
      `test-card-${internalId}`
    );
    expect(updatedTestCard).toHaveClass("prime-queue-item__error");
    const dateLabel = await screen.findByText("Test date and time");
    expect(dateLabel).toHaveClass("queue-item-error-message");
    const updatedDateInput = await screen.findByTestId("test-date");
    expect(updatedDateInput).toHaveClass("card-test-input__error");
  });

  it("highlights test corrections and includes corrector name and reason for correction", async () => {
    render(
      <MockedProvider>
        <Provider store={store}>
          <QueueItem
            internalId={testProps.internalId}
            patient={testProps.patient}
            askOnEntry={testProps.askOnEntry}
            selectedDeviceId={testProps.selectedDeviceId}
            selectedDeviceTestLength={testProps.selectedDeviceTestLength}
            selectedDeviceSpecimenTypeId={
              testProps.selectedDeviceSpecimenTypeId
            }
            deviceSpecimenTypes={testProps.deviceSpecimenTypes}
            selectedTestResults={testProps.selectedTestResults}
            devices={testProps.devices}
            refetchQueue={testProps.refetchQueue}
            facilityId={testProps.facilityId}
            dateTestedProp={testProps.dateTestedProp}
            facilityName="Foo facility"
            isCorrection={true}
            reasonForCorrection={TestCorrectionReason.INCORRECT_RESULT}
            startTestPatientId={null}
            setStartTestPatientId={() => {}}
          />
        </Provider>
      </MockedProvider>
    );
    const testCard = await screen.findByTestId(`test-card-${internalId}`);

    // Card is highlighted for visibility
    expect(testCard).toHaveClass("prime-queue-item__ready");

    expect(
      await within(testCard).findByText("Incorrect test result", {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("displays person's mobile phone numbers", async () => {
    render(
      <MemoryRouter>
        <MockedProvider addTypename={false}>
          <Provider store={store}>
            <QueueItem
              internalId={testProps.internalId}
              patient={testProps.patient}
              askOnEntry={testProps.askOnEntry}
              selectedDeviceId={testProps.selectedDeviceId}
              selectedDeviceTestLength={testProps.selectedDeviceTestLength}
              selectedDeviceSpecimenTypeId={
                testProps.selectedDeviceSpecimenTypeId
              }
              deviceSpecimenTypes={testProps.deviceSpecimenTypes}
              selectedTestResults={testProps.selectedTestResults}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              facilityName="Foo facility"
              setStartTestPatientId={setStartTestPatientIdMock}
              startTestPatientId=""
            />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );

    const questionnaire = await screen.findByText("Test questionnaire");
    userEvent.click(questionnaire);
    await screen.findByText("Required fields are marked", { exact: false });
    expect(
      screen.getByText(testProps.patient.phoneNumbers[0].number, {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(testProps.patient.phoneNumbers[1].number)
    ).not.toBeInTheDocument();
  });

  describe("telemetry", () => {
    beforeEach(() => {
      render(
        <MemoryRouter>
          <MockedProvider addTypename={false}>
            <Provider store={store}>
              <QueueItem
                internalId={testProps.internalId}
                patient={testProps.patient}
                askOnEntry={testProps.askOnEntry}
                selectedDeviceId={testProps.selectedDeviceId}
                selectedDeviceTestLength={testProps.selectedDeviceTestLength}
                selectedDeviceSpecimenTypeId={
                  testProps.selectedDeviceSpecimenTypeId
                }
                deviceSpecimenTypes={testProps.deviceSpecimenTypes}
                selectedTestResults={[
                  { disease: { name: "COVID-19" }, testResult: "UNDETERMINED" },
                ]}
                devices={testProps.devices}
                refetchQueue={testProps.refetchQueue}
                facilityId={testProps.facilityId}
                dateTestedProp={testProps.dateTestedProp}
                facilityName="Foo facility"
                setStartTestPatientId={setStartTestPatientIdMock}
                startTestPatientId=""
              />
            </Provider>
          </MockedProvider>
        </MemoryRouter>
      );
    });

    it("tracks removal of patient from queue as custom event", () => {
      const button = screen.getByLabelText(
        `Close test for Potter, Harry James`
      );
      userEvent.click(button);
      const iAmSure = screen.getByText("Yes, I'm sure");
      userEvent.click(iAmSure);
      expect(trackEventMock).toHaveBeenCalledWith({
        name: "Remove Patient From Queue",
      });
    });

    it("tracks submitted test result as custom event", async () => {
      // Select result
      userEvent.click(
        screen.getByLabelText("Inconclusive", {
          exact: false,
        })
      );

      // Wait for the genuinely long-running "edit queue" operation to finish
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Submit
      userEvent.click(screen.getByText("Submit"));
      userEvent.click(screen.getByText(/Submit anyway/i));
      expect(trackEventMock).toHaveBeenCalledWith({
        name: "Submit Test Result",
      });
    });

    it("tracks AoE form updates as custom event", async () => {
      // Update AoE questionnaire
      const questionnaire = await screen.findByText("Test questionnaire");
      userEvent.click(questionnaire);
      const symptomInput = await screen.findByText("No symptoms", {
        exact: false,
      });
      userEvent.click(symptomInput);

      // Save changes
      const continueButton = await screen.findByText("Continue");
      userEvent.click(continueButton);

      expect(trackEventMock).toHaveBeenCalledWith({
        name: "Update AoE Response",
      });
    });
  });
  describe("when a multiplex device is chosen", () => {
    beforeEach(() => {
      jest.spyOn(flaggedMock, "useFeature").mockReturnValue(true);

      const selectedTestResults: MultiplexResult[] = [
        {
          disease: { name: "COVID-19" },
          testResult: "POSITIVE",
        },
        { disease: { name: "Flu A" }, testResult: "NEGATIVE" },
        { disease: { name: "Flu B" }, testResult: "NEGATIVE" },
      ];
      const editQueueMocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: internalId,
              deviceSpecimenType: "device-specimen-3",
              deviceId: "multiplex",
              results: [
                { diseaseName: "COVID-19", testResult: "POSITIVE" },
                {
                  diseaseName: "Flu A",
                  testResult: "POSITIVE",
                },
                { diseaseName: "Flu B", testResult: "NEGATIVE" },
              ],
            },
          },
          result: () => {
            return {
              data: {
                editQueueItemMultiplexResult: {
                  results: [
                    {
                      disease: { name: "COVID-19" },
                      testResult: "POSITIVE",
                    },
                    {
                      disease: { name: "Flu A" },
                      testResult: "POSITIVE",
                    },
                    {
                      disease: { name: "Flu B" },
                      testResult: "NEGATIVE",
                    },
                  ],
                  dateTested: null,
                  deviceType: {
                    internalId: internalId,
                    testLength: 10,
                  },
                  deviceSpecimenType: {
                    internalId: "device-specimen-3",
                    deviceType: deviceThree,
                    specimenType: {},
                  },
                },
              },
            };
          },
        },
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: internalId,
              deviceSpecimenType: "device-specimen-3",
              deviceId: "multiplex",
              results: [
                { diseaseName: "COVID-19", testResult: "POSITIVE" },
                {
                  diseaseName: "Flu A",
                  testResult: "NEGATIVE",
                },
                { diseaseName: "Flu B", testResult: "POSITIVE" },
              ],
            },
          },
          result: () => {
            return {
              data: {
                editQueueItemMultiplexResult: {
                  results: [
                    {
                      disease: { name: "COVID-19" },
                      testResult: "POSITIVE",
                    },
                    {
                      disease: { name: "Flu A" },
                      testResult: "NEGATIVE",
                    },
                    {
                      disease: { name: "Flu B" },
                      testResult: "POSITIVE",
                    },
                  ],
                  dateTested: null,
                  deviceType: {
                    internalId: internalId,
                    testLength: 10,
                  },
                  deviceSpecimenType: {
                    internalId: "device-specimen-3",
                    deviceType: deviceThree,
                    specimenType: {},
                  },
                },
              },
            };
          },
        },
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: internalId,
              deviceSpecimenType: "device-specimen-3",
              deviceId: "multiplex",
              results: [
                { diseaseName: "COVID-19", testResult: "UNDETERMINED" },
                {
                  diseaseName: "Flu A",
                  testResult: "UNDETERMINED",
                },
                { diseaseName: "Flu B", testResult: "UNDETERMINED" },
              ],
            },
          },
          result: () => {
            return {
              data: {
                editQueueItemMultiplexResult: {
                  results: [
                    {
                      disease: { name: "COVID-19" },
                      testResult: "UNDETERMINED",
                    },
                    {
                      disease: { name: "Flu A" },
                      testResult: "UNDETERMINED",
                    },
                    {
                      disease: { name: "Flu B" },
                      testResult: "UNDETERMINED",
                    },
                  ],
                  dateTested: null,
                  deviceType: {
                    internalId: internalId,
                    testLength: 10,
                  },
                  deviceSpecimenType: {
                    internalId: "device-specimen-3",
                    deviceType: deviceThree,
                    specimenType: {},
                  },
                },
              },
            };
          },
        },
      ];
      render(
        <MemoryRouter>
          <MockedProvider mocks={editQueueMocks} addTypename={false}>
            <Provider store={store}>
              <QueueItem
                internalId={testProps.internalId}
                patient={testProps.patient}
                askOnEntry={testProps.askOnEntry}
                selectedDeviceId="multiplex"
                selectedDeviceTestLength={testProps.selectedDeviceTestLength}
                selectedDeviceSpecimenTypeId="device-specimen-3"
                deviceSpecimenTypes={testProps.deviceSpecimenTypes}
                selectedTestResults={selectedTestResults}
                devices={testProps.devices}
                refetchQueue={testProps.refetchQueue}
                facilityId={testProps.facilityId}
                dateTestedProp={testProps.dateTestedProp}
                facilityName="Foo facility"
                setStartTestPatientId={setStartTestPatientIdMock}
                startTestPatientId=""
              />
            </Provider>
          </MockedProvider>
        </MemoryRouter>
      );
    });
    afterEach(() => {
      jest.resetAllMocks();
    });

    it("renders radio buttons with results for Flu A and Flu B", () => {
      expect(screen.getByText("Flu A")).toBeInTheDocument();
      expect(screen.getByText("Flu B")).toBeInTheDocument();

      expect(screen.getAllByLabelText("Positive (+)")[0]).toBeChecked();
      expect(screen.getAllByLabelText("Positive (+)")[1]).not.toBeChecked();
      expect(screen.getAllByLabelText("Positive (+)")[2]).not.toBeChecked();
      expect(screen.getAllByLabelText("Negative (-)")[0]).not.toBeChecked();
      expect(screen.getAllByLabelText("Negative (-)")[1]).toBeChecked();
      expect(screen.getAllByLabelText("Negative (-)")[2]).toBeChecked();
      expect(
        screen.getByLabelText("inconclusive", { exact: false })
      ).not.toBeChecked();
    });

    it("updates the result when a new radio is clicked", async () => {
      expect(screen.getAllByLabelText("Positive (+)")[1]).not.toBeChecked();
      userEvent.click(screen.getAllByLabelText("Positive (+)")[1]);

      const editQueueSpy = jest.spyOn(
        generatedGraphql,
        "useEditQueueItemMultiplexResultMutation"
      );
      await waitFor(() => expect(editQueueSpy).toHaveBeenCalled());
    });
  });
});

const internalId = "f5c7658d-a0d5-4ec5-a1c9-eafc85fe7554";
const deviceOne = {
  name: "Access Bio CareStart",
  internalId: internalId,
  testLength: 10,
  supportedDiseases: [{ internalId: "1", name: "COVID-19" }],
};

const deviceTwo = {
  name: "LumiraDX",
  internalId: "lumira",
  testLength: 15,
  supportedDiseases: [{ internalId: "1", name: "COVID-19" }],
};

const deviceThree = {
  name: "MultiplexMate",
  internalId: "multiplex",
  testLength: 15,
  supportedDiseases: [
    { internalId: "1", name: "COVID-19" },
    { internalId: "2", name: "Flu A" },
    {
      internalId: "3",
      name: "Flu B",
    },
  ],
};

const testProps = {
  internalId: internalId,
  patient: {
    internalId: internalId,
    firstName: "Harry",
    middleName: "James",
    lastName: "Potter",
    telephone: "fakenumber",
    birthDate: "1990-07-31",
    phoneNumbers: [
      {
        number: "a-mobile-number",
        type: "MOBILE",
      },
      {
        number: "a-landline-number",
        type: "LANDLINE",
      },
    ],
    email: "foo",
    emails: ["foo"],
    gender: "male" as Gender,
    testResultDelivery: "sms",
  },
  devices: [deviceOne, deviceTwo],
  askOnEntry: {
    symptoms: "{}",
  } as any,
  testResultPreference: "SMS",
  selectedDeviceId: internalId,
  selectedDeviceTestLength: 10,
  selectedDeviceSpecimenTypeId: "device-specimen-1",
  selectedTestResults: [] as any,
  dateTestedProp: "",
  refetchQueue: jest.fn().mockReturnValue(null),
  facilityId: "Hogwarts+123",
  patientLinkId: "",
  deviceSpecimenTypes: [
    {
      internalId: "device-specimen-1",
      deviceType: deviceOne,
      specimenType: {
        internalId: "specimen-1",
        name: "Specimen 1",
      },
    },
    {
      internalId: "device-specimen-2",
      deviceType: deviceTwo,
      specimenType: {
        internalId: "specimen-2",
        name: "Specimen 2",
      },
    },
    {
      internalId: "device-specimen-3",
      deviceType: deviceThree,
      specimenType: {
        internalId: "specimen-3",
        name: "Specimen 3",
      },
    },
  ] as DeviceSpecimenType[],
};
