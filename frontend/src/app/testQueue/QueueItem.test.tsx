import { MockedProvider } from "@apollo/client/testing";
import { ToastContainer } from "react-toastify";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import moment from "moment";

import * as utils from "../utils/index";

import QueueItem, { EDIT_QUEUE_ITEM, SUBMIT_TEST_RESULT } from "./QueueItem";

const initialDateString = "2021-02-14";
const updatedDateString = "2021-03-10";
const updatedTimeString = "10:05";
const fakeDate = Date.parse(initialDateString);
const updatedDate = Date.parse(updatedDateString);

describe("QueueItem", () => {
  let nowFn = Date.now;
  beforeEach(() => {
    jest.useFakeTimers();
    Date.now = jest.fn(() => fakeDate);
  });
  afterEach(() => {
    jest.useRealTimers();
    Date.now = nowFn;
  });
  it("correctly renders the test queue", () => {
    const { container, getByTestId } = render(
      <MockedProvider mocks={[]}>
        <QueueItem
          internalId={testProps.internalId}
          patient={testProps.patient}
          askOnEntry={testProps.askOnEntry}
          selectedDeviceId={testProps.selectedDeviceId}
          selectedDeviceTestLength={testProps.selectedDeviceTestLength}
          selectedTestResult={testProps.selectedTestResult}
          devices={testProps.devices}
          refetchQueue={testProps.refetchQueue}
          facilityId={testProps.facilityId}
          dateTestedProp={testProps.dateTestedProp}
          patientLinkId={testProps.patientLinkId}
        ></QueueItem>
      </MockedProvider>
    );
    expect(screen.getByText("Potter, Harry James")).toBeInTheDocument();
    expect(getByTestId("timer")).toHaveTextContent("10:00");
    expect(container).toMatchSnapshot();
  });

  it("updates the timer when a device is changed", async () => {
    const { getByTestId, getByLabelText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <QueueItem
          internalId={testProps.internalId}
          patient={testProps.patient}
          askOnEntry={testProps.askOnEntry}
          selectedDeviceId={testProps.selectedDeviceId}
          selectedDeviceTestLength={testProps.selectedDeviceTestLength}
          selectedTestResult={testProps.selectedTestResult}
          devices={testProps.devices}
          refetchQueue={testProps.refetchQueue}
          facilityId={testProps.facilityId}
          dateTestedProp={testProps.dateTestedProp}
          patientLinkId={testProps.patientLinkId}
        ></QueueItem>
      </MockedProvider>
    );
    await waitFor(() => {
      fireEvent.change(getByLabelText("Device", { exact: false }), {
        target: { value: "lumira" },
      });
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(getByTestId("timer")).toHaveTextContent("15:00");
      jest.advanceTimersToNextTimer(1000);
    });
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
      render(
        <>
          <MockedProvider mocks={mocks} addTypename={false}>
            <QueueItem
              internalId={testProps.internalId}
              patient={testProps.patient}
              askOnEntry={testProps.askOnEntry}
              selectedDeviceId={testProps.selectedDeviceId}
              selectedDeviceTestLength={testProps.selectedDeviceTestLength}
              selectedTestResult={testProps.selectedTestResult}
              devices={testProps.devices}
              refetchQueue={testProps.refetchQueue}
              facilityId={testProps.facilityId}
              dateTestedProp={testProps.dateTestedProp}
              patientLinkId={testProps.patientLinkId}
            ></QueueItem>
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
      await waitFor(() => {
        fireEvent.click(
          screen.getByLabelText("Inconclusive", {
            exact: false,
          }),
          {
            target: { value: "UNDETERMINED" },
          }
        );
      });

      await waitFor(() => {
        jest.advanceTimersByTime(1000);
      });

      // Submit
      await waitFor(() => {
        fireEvent.click(screen.getByText("Submit"));
      });

      await waitFor(() => {
        fireEvent.click(
          screen.getByText("Submit anyway", {
            exact: false,
          })
        );
      });

      // Displays submitting indicator
      expect(
        await screen.findByText(
          "Submitting test data for Potter, Harry James..."
        )
      );

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
      await waitFor(() => {
        expect(screen.queryByText("Potter, Harry James"));
        expect(
          screen.queryByText("Submitting test data for Potter, Harry James...")
        );
      });
    });
  });

  it("updates custom test date/time", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <QueueItem
          internalId={testProps.internalId}
          patient={testProps.patient}
          askOnEntry={testProps.askOnEntry}
          selectedDeviceId={testProps.selectedDeviceId}
          selectedDeviceTestLength={testProps.selectedDeviceTestLength}
          selectedTestResult={testProps.selectedTestResult}
          devices={testProps.devices}
          refetchQueue={testProps.refetchQueue}
          facilityId={testProps.facilityId}
          dateTestedProp={testProps.dateTestedProp}
          patientLinkId={testProps.patientLinkId}
        ></QueueItem>
      </MockedProvider>
    );
    const toggle = await screen.findByLabelText("Use current date");
    await waitFor(() => {
      fireEvent.click(toggle);
    });
    const dateInput = screen.getByLabelText("Test date");
    expect(dateInput).toBeInTheDocument();
    const timeInput = screen.getByLabelText("Test time");
    expect(timeInput).toBeInTheDocument();
    await waitFor(() => {
      fireEvent.input(dateInput, {
        target: { value: `${updatedDateString}T00:00` },
      });
    });
    await waitFor(() => {
      fireEvent.input(timeInput, {
        target: { value: updatedTimeString },
      });
    });
  });

  it("displays person's mobile phone numbers", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <QueueItem
          internalId={testProps.internalId}
          patient={testProps.patient}
          askOnEntry={testProps.askOnEntry}
          selectedDeviceId={testProps.selectedDeviceId}
          selectedDeviceTestLength={testProps.selectedDeviceTestLength}
          selectedTestResult={testProps.selectedTestResult}
          devices={testProps.devices}
          refetchQueue={testProps.refetchQueue}
          facilityId={testProps.facilityId}
          dateTestedProp={testProps.dateTestedProp}
          patientLinkId={testProps.patientLinkId}
        ></QueueItem>
      </MockedProvider>
    );

    const questionnaire = await screen.findByText("Test questionnaire");
    fireEvent.click(questionnaire);
    await screen.findByText("Required fields are marked", { exact: false });
    expect(
      screen.queryByText(testProps.patient.phoneNumbers[0].number, {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(testProps.patient.phoneNumbers[1].number)
    ).not.toBeInTheDocument();
  });
});

const internalId = "f5c7658d-a0d5-4ec5-a1c9-eafc85fe7554";

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
  },
  devices: [
    {
      name: "Access Bio CareStart",
      internalId: internalId,
      testLength: 10,
    },
    {
      name: "LumiraDX",
      internalId: "lumira",
      testLength: 15,
    },
  ],
  askOnEntry: {
    symptoms: "{}",
  },
  selectedDeviceId: internalId,
  selectedDeviceTestLength: 10,
  selectedTestResult: {},
  dateTestedProp: "",
  refetchQueue: {},
  facilityId: "Hogwarts",
  patientLinkId: "",
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
            testLength: 15,
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
        dateTested: nowUTC,
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
            testLength: 15,
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
            testLength: 15,
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
            testLength: 15,
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
            testLength: 15,
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
        dateTested: null,
        result: "UNDETERMINED",
      },
    },
    result: {
      data: {
        addTestResultNew: {
          testResult: {
            internalId: internalId,
          },
          deliverySuccess: false,
        },
      },
    },
  },
];
