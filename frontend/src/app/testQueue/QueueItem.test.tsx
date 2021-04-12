import { MockedProvider } from "@apollo/client/testing";
import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";

import QueueItem, { EDIT_QUEUE_ITEM } from "./QueueItem";

describe("QueueItem", () => {
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
          defaultDevice={testProps.defaultDevice}
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
          defaultDevice={testProps.defaultDevice}
          refetchQueue={testProps.refetchQueue}
          facilityId={testProps.facilityId}
          dateTestedProp={testProps.dateTestedProp}
          patientLinkId={testProps.patientLinkId}
        ></QueueItem>
      </MockedProvider>
    );
    await act(async () => {
      fireEvent.change(getByLabelText("Device", { exact: false }), {
        target: { value: "lumira" },
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(getByTestId("timer")).toHaveTextContent("15:00");
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
    telephone: "string",
    birthDate: "1990-07-31",
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
  defaultDevice: {
    internalId: internalId,
  },
  dateTestedProp: "",
  refetchQueue: {},
  facilityId: "Hogwarts",
  patientLinkId: "",
};

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
];
