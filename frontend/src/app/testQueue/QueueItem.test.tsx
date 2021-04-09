// things to test:
// screenshot, asserting that it renders correctly (or just a render test with all the patient information mocked)
// if the device changes, the timer should change as well
// all the various buttons?
// submitting causes the queue item to disappear
// exiting causes the modal to pop up and queue item to disappear if requested (addPatient should have some tests for this already?)
// updating works as intended (everything from update queue item props)

import { MockedProvider } from "@apollo/client/testing";
import { fireEvent, render, screen } from "@testing-library/react";

import QueueItem, { EDIT_QUEUE_ITEM } from "./QueueItem";

// the mocks describe mocked interactions with the request/response from graphQL servers
// it's not a mock of the props, it's a mock of server interactions

describe("QueueItem", () => {
    let container: any;
    // beforeEach(() => {
    // container = render(
    //   <MockedProvider mocks={[]}>
    //     <QueueItem
    //       internalId={testProps.internalId}
    //       patient={testProps.patient}
    //       askOnEntry={testProps.askOnEntry}
    //       selectedDeviceId={testProps.selectedDeviceId}
    //       selectedDeviceTestLength={testProps.selectedDeviceTestLength}
    //       selectedTestResult={testProps.selectedTestResult}
    //       devices={testProps.devices}
    //       defaultDevice={testProps.defaultDevice}
    //       refetchQueue={testProps.refetchQueue}
    //       facilityId={testProps.facilityId}
    //       dateTestedProp={testProps.dateTestedProp}
    //       patientLinkId={testProps.patientLinkId}
    //     ></QueueItem>
    //   </MockedProvider>
    // );
    // });
  it("correctly renders the test queue", () => {
    const {container} = render(
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
    expect(
        screen.getByText("Potter, Harry James")
      ).toBeInTheDocument();
      expect(
          screen.getByText("10:00")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
  it("updates the timer when a device is changed", () => {
      // need to figure out how to mock selecting an element here
      // then assert that the timer adjusts to the new time and renders correctly
      // then also add a test for Timer
      const { getByTestId, getByLabelText, getAllByTestId } = render(
        <MockedProvider mocks={mocks}>
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
      )

    //   console.log(getByTestId("selected-device"));
      console.log(screen.debug());
      fireEvent.change(getByTestId("selected-device"), { target: { value: 'lumira' } });

      // so this doesn't really work because it adds a testid to only the selected option. 
      // Might need to go into the dropdown component to add the testid there
      expect(getByTestId("selected-device")).toHaveValue("lumira");
  });
});

/**
 * const { getByTestId, getAllByTestId } = render(<App />);
  //The value should be the key of the option
  fireEvent.change(getByTestId('select'), { target: { value: 2 } })
 * let options = getAllByTestId('select-option')
  expect(options[0].selected).toBeFalsy();
  expect(options[1].selected).toBeTruthy();
  expect(options[2].selected).toBeFalsy();
 * 
 * it("selects an item by clicking on an option", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );

      fireEvent.click(getByTestId("combo-box-toggle"));
      fireEvent.click(getByTestId("combo-box-option-apple"));

      expect(onChange).toHaveBeenLastCalledWith("apple");
      expect(getByTestId("combo-box-input")).toHaveValue("Apple");
    });
 */

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

// probably need to add a mock here for edit queue item props (so that the device works)
// edit patient test request/results is an example
// Mocks for edit patient
const mocks = [
    {
        request: {
            query: EDIT_QUEUE_ITEM,
            variables: {
                id: internalId,
                deviceId: "lumira",
                result: {},
                dateTested: "",
            },
        },
        result: {
            data: {
                editQueueItem: {
                    result: {},
                    dateTested: "",
                    deviceType: {
                        internalId: "lumira",
                        testLength: 15,
                    },
                },
            },
        },
    }

];
