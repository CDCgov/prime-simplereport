import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import configureStore, { MockStoreEnhanced } from "redux-mock-store";
import { render, screen, waitFor } from "@testing-library/react";
import moment from "moment";
import userEvent from "@testing-library/user-event";

import { getAppInsights } from "../TelemetryService";
import * as utils from "../utils/index";

import QueueItem, { EDIT_QUEUE_ITEM, SUBMIT_TEST_RESULT } from "./QueueItem";

jest.mock("../TelemetryService", () => ({
  getAppInsights: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: mockPush,
  }),
}));

const initialDateString = "2021-02-14";
const updatedDateString = "2021-03-10";
const updatedTimeString = "10:05";
const fakeDate = Date.parse(initialDateString);
const updatedDate = Date.parse(updatedDateString);

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
      <MockedProvider mocks={[]}>
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
            selectedTestResult={testProps.selectedTestResult}
            devices={testProps.devices}
            refetchQueue={testProps.refetchQueue}
            facilityId={testProps.facilityId}
            dateTestedProp={testProps.dateTestedProp}
            facilityName="Foo facility"
          />
        </Provider>
      </MockedProvider>
    );
    expect(screen.getByText("Potter, Harry James")).toBeInTheDocument();
    expect(screen.getByTestId("timer")).toHaveTextContent("10:00");
  });

  it("navigates to edit the user when clicking their name", () => {
    render(
      <MockedProvider mocks={[]}>
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
            selectedTestResult={testProps.selectedTestResult}
            devices={testProps.devices}
            refetchQueue={testProps.refetchQueue}
            facilityId={testProps.facilityId}
            dateTestedProp={testProps.dateTestedProp}
            facilityName="Foo facility"
          />
        </Provider>
      </MockedProvider>
    );
    const patientName = screen.getByText("Potter, Harry James");
    expect(patientName).toBeInTheDocument();
    userEvent.click(patientName);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/patient/f5c7658d-a0d5-4ec5-a1c9-eafc85fe7554",
      search: "?facility=Hogwarts+123",
    });
  });

  it("updates the timer when a device is changed", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
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
            selectedTestResult={testProps.selectedTestResult}
            devices={testProps.devices}
            refetchQueue={testProps.refetchQueue}
            facilityId={testProps.facilityId}
            dateTestedProp={testProps.dateTestedProp}
            facilityName="Foo facility"
          />
        </Provider>
      </MockedProvider>
    );

    userEvent.type(screen.getByLabelText("Device", { exact: false }), "lumira");

    expect(await screen.findByTestId("timer")).toHaveTextContent("10:00");
  });

  it("renders dropdown of device types", async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
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
            selectedTestResult={testProps.selectedTestResult}
            devices={testProps.devices}
            refetchQueue={testProps.refetchQueue}
            facilityId={testProps.facilityId}
            dateTestedProp={testProps.dateTestedProp}
            facilityName="Foo facility"
          />
        </Provider>
      </MockedProvider>
    );

    const deviceDropdown = await screen.findByLabelText("Device");

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
      <MockedProvider mocks={[]} addTypename={false}>
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
            selectedTestResult={testProps.selectedTestResult}
            devices={testProps.devices}
            refetchQueue={testProps.refetchQueue}
            facilityId={testProps.facilityId}
            dateTestedProp={testProps.dateTestedProp}
            facilityName="Foo facility"
          />
        </Provider>
      </MockedProvider>
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

  it("selects a default device specimen type if type configured for test is invalid", async () => {
    let editQueueMockIsDone = false;

    const editQueueMocks = [
      {
        request: {
          query: EDIT_QUEUE_ITEM,
          variables: {
            id: internalId,
            deviceId: internalId,
            result: "UNDETERMINED",
            dateTested: undefined,
            // This is _not_ the facility's default device or one selected
            // manually - given a non-existent device specimen ID, the
            // component should select another available one automatically
            deviceSpecimenType: "device-specimen-1",
          },
        },
        result: () => {
          editQueueMockIsDone = true;

          return {};
        },
      },
    ];

    render(
      <MockedProvider mocks={editQueueMocks} addTypename={false}>
        <Provider store={store}>
          <QueueItem
            internalId={testProps.internalId}
            patient={testProps.patient}
            askOnEntry={testProps.askOnEntry}
            selectedDeviceId={testProps.selectedDeviceId}
            selectedDeviceTestLength={testProps.selectedDeviceTestLength}
            // This is the important part: this ID should not be passed
            // along in the GraphQL request
            selectedDeviceSpecimenTypeId="nonexistent-device-id"
            deviceSpecimenTypes={testProps.deviceSpecimenTypes}
            selectedTestResult={testProps.selectedTestResult}
            devices={testProps.devices}
            refetchQueue={testProps.refetchQueue}
            facilityId={testProps.facilityId}
            dateTestedProp={testProps.dateTestedProp}
            patientLinkId={testProps.patientLinkId}
          />
        </Provider>
      </MockedProvider>
    );

    // Select result to trigger an editQueueItem call
    userEvent.click(
      screen.getByLabelText("Inconclusive", {
        exact: false,
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 600));

    // `true` iff a valid replacement default device specimen type was
    // selected by the component
    expect(editQueueMockIsDone).toBe(true);
  });

  it("updates test order on device specimen type change", async () => {
    let editQueueMockIsDone = false;

    const editQueueMocks = [
      {
        request: {
          query: EDIT_QUEUE_ITEM,
          variables: {
            id: internalId,
            deviceSpecimenType: "device-specimen-2",
            deviceId: "lumira",
            result: "POSITIVE",
          },
        },
        result: () => {
          editQueueMockIsDone = true;

          return {
            data: {
              editQueueItem: {
                result: "UNDETERMINED",
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
    ];

    render(
      <>
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
              selectedTestResult={testProps.selectedTestResult}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              facilityName="Foo facility"
            />
          </Provider>
        </MockedProvider>
        <ToastContainer
          autoClose={5000}
          closeButton={false}
          limit={2}
          position="bottom-center"
          hideProgressBar={true}
        />
      </>
    );

    const deviceDropdown = await screen.findByLabelText("Device");

    // Change device type
    userEvent.selectOptions(deviceDropdown, "LumiraDX");
    userEvent.click(screen.getByLabelText("Positive", { exact: false }));

    await waitFor(() => expect(editQueueMockIsDone).toBe(true));
  });

  describe("SMS delivery failure", () => {
    let alertSpy: jest.SpyInstance;
    beforeEach(() => {
      alertSpy = jest.spyOn(utils, "showNotification");
    });

    afterEach(() => {
      alertSpy.mockRestore();
    });

    it("displays delivery failure alert on submit for invalid patient phone number", async () => {
      let submitTestMockIsDone = false;

      const submitTestResultMocks = [
        {
          request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
              id: internalId,
              deviceSpecimenType: "device-specimen-1",
              deviceId: internalId,
              result: "UNDETERMINED",
            },
          },
          result: {
            data: {
              editQueueItem: {
                result: "UNDETERMINED",
                dateTested: null,
                deviceType: {
                  internalId: internalId,
                  testLength: 10,
                },
                deviceSpecimenType: {
                  internalId: "device-specimen-1",
                  deviceType: deviceOne,
                  specimenType: {},
                },
              },
            },
          },
        },
        {
          request: {
            query: SUBMIT_TEST_RESULT,
            variables: {
              patientId: internalId,
              deviceId: internalId,
              deviceSpecimenType: "device-specimen-1",
              result: "UNDETERMINED",
              dateTested: null,
            },
          },
          result: () => {
            submitTestMockIsDone = true;
            return {
              data: {
                addTestResultNew: {
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
                selectedTestResult={testProps.selectedTestResult}
                devices={testProps.devices}
                refetchQueue={testProps.refetchQueue}
                facilityId={testProps.facilityId}
                dateTestedProp={testProps.dateTestedProp}
                facilityName="Foo facility"
              />
            </Provider>
          </MockedProvider>
          <ToastContainer
            autoClose={5000}
            closeButton={false}
            limit={2}
            position="bottom-center"
            hideProgressBar={true}
          />
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
      <MockedProvider mocks={mocks} addTypename={false}>
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
            selectedTestResult={testProps.selectedTestResult}
            devices={testProps.devices}
            refetchQueue={testProps.refetchQueue}
            facilityId={testProps.facilityId}
            dateTestedProp={testProps.dateTestedProp}
            facilityName="Foo facility"
          />
        </Provider>
      </MockedProvider>
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
        <MockedProvider mocks={mocks} addTypename={false}>
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
              selectedTestResult={testProps.selectedTestResult}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              facilityName="Foo facility"
            />
          </Provider>
        </MockedProvider>
        <ToastContainer
          autoClose={5000}
          closeButton={false}
          limit={2}
          position="bottom-center"
          hideProgressBar={true}
        />
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

  it("displays person's mobile phone numbers", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
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
            selectedTestResult={testProps.selectedTestResult}
            devices={testProps.devices}
            refetchQueue={testProps.refetchQueue}
            facilityId={testProps.facilityId}
            dateTestedProp={testProps.dateTestedProp}
            facilityName="Foo facility"
          />
        </Provider>
      </MockedProvider>
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
        <MockedProvider mocks={mocks} addTypename={false}>
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
              selectedTestResult={testProps.selectedTestResult}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              facilityName="Foo facility"
            />
          </Provider>
        </MockedProvider>
      );
    });

    it("tracks removal of patient from queue as custom event", () => {
      const button = screen.getByLabelText("Close");
      userEvent.click(button);
      const iAmSure = screen.getByText("Yes, I'm sure");
      userEvent.click(iAmSure);
      expect(trackEventMock).toHaveBeenCalledWith({
        name: "Remove Patient From Queue",
      });
    });

    it("tracks submitted test result as custom event", async () => {
      // Submit
      userEvent.click(screen.getByText("Submit"));
      userEvent.click(screen.getByText("Submit anyway"));

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
});

const internalId = "f5c7658d-a0d5-4ec5-a1c9-eafc85fe7554";
const deviceOne = {
  name: "Access Bio CareStart",
  internalId: internalId,
  testLength: 10,
};

const deviceTwo = {
  name: "LumiraDX",
  internalId: "lumira",
  testLength: 15,
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
  selectedTestResult: {} as any,
  dateTestedProp: "",
  refetchQueue: () => null,
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
  ] as DeviceSpecimenType[],
};

const nowUTC = moment(new Date(fakeDate))
  .seconds(0)
  .milliseconds(0)
  .toISOString();
const updatedDateUTC = moment(new Date(updatedDate))
  .seconds(0)
  .milliseconds(0)
  .toISOString();

const updatedDateTimeUTC = moment(
  new Date(`${updatedDateString}T${updatedTimeString}`)
).toISOString();

const mocks = [
  {
    request: {
      query: EDIT_QUEUE_ITEM,
      variables: {
        id: internalId,
        deviceId: "lumira",
        deviceSpecimenType: "device-specimen-2",
        result: {},
      },
    },
    result: {
      data: {
        editQueueItem: {
          result: {},
          dateTested: null,
          deviceType: deviceTwo,
          deviceSpecimenType: {
            internalId: "device-specimen-2",
            deviceType: deviceTwo,
            specimenType: {},
          },
        },
      },
    },
  },
  {
    request: {
      query: EDIT_QUEUE_ITEM,
      variables: {
        id: internalId,
        deviceId: internalId,
        deviceSpecimenType: "device-specimen-1",
        dateTested: nowUTC,
        result: {},
      },
    },
    result: {
      data: {
        editQueueItem: {
          result: {},
          dateTested: null,
          deviceType: deviceOne,
          deviceSpecimenType: {
            internalId: "device-specimen-1",
            deviceType: deviceOne,
            specimenType: {},
          },
        },
      },
    },
  },
  {
    request: {
      query: EDIT_QUEUE_ITEM,
      variables: {
        id: internalId,
        deviceId: internalId,
        deviceSpecimenType: "device-specimen-1",
        dateTested: updatedDateUTC,
        result: {},
      },
    },
    result: {
      data: {
        editQueueItem: {
          result: {},
          dateTested: null,
          deviceType: {
            internalId: internalId,
            testLength: 10,
          },
          deviceSpecimenType: {
            internalId: "device-specimen-1",
            deviceType: deviceOne,
            specimenType: {},
          },
        },
      },
    },
  },
  {
    request: {
      query: EDIT_QUEUE_ITEM,
      variables: {
        id: internalId,
        deviceId: internalId,
        deviceSpecimenType: "device-specimen-1",
        dateTested: updatedDateTimeUTC,
        result: {},
      },
    },
    result: {
      data: {
        editQueueItem: {
          result: {},
          dateTested: null,
          deviceType: {
            internalId: internalId,
            testLength: 10,
          },
          deviceSpecimenType: {
            internalId: "device-specimen-1",
            deviceType: deviceOne,
            specimenType: {},
          },
        },
      },
    },
  },
];
